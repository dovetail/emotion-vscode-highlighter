import * as vscode from "vscode";
import { EmotionAnalyzer } from "./analyzer";
import { ExtendedAnalysisResult } from "./types";

let analyzer: EmotionAnalyzer;
let decorationType: vscode.TextEditorDecorationType | undefined;

// Get the configured color from the single setting
function getConfiguredColor(): string | null {
  const config = vscode.workspace.getConfiguration('editor');
  const setting = config.get('styledComponentHighlighting.enabled');
  
  // If disabled, return null (no highlighting)
  if (setting === false) {
    return null;
  }
  
  // If hex color provided, use it
  if (typeof setting === 'string' && setting.startsWith('#')) {
    return setting;
  }
  
  // If true or missing, use fallback color
  if (setting === true || setting === undefined) {
    return '#FF69B4';
  }
  
  // Fallback
  return '#FF69B4';
}

// Create decoration type based on configured color
function createDecorationType(): vscode.TextEditorDecorationType | undefined {
  const color = getConfiguredColor();
  
  if (!color) {
    return undefined;
  }
  
  return vscode.window.createTextEditorDecorationType({
    color: color,
    fontWeight: 'normal'
  });
}

// Apply decorations to a document
async function applyDecorations(editor: vscode.TextEditor) {
  if (!decorationType) {
    return;
  }
  
  const document = editor.document;
  
  // Check if highlighting is enabled
  const color = getConfiguredColor();
  if (!color) {
    editor.setDecorations(decorationType, []);
    return;
  }
  
  // Check if this is a supported language
  const isSupported = [
    "typescript",
    "typescriptreact", 
    "javascript",
    "javascriptreact",
  ].includes(document.languageId);
  
  if (!isSupported) {
    editor.setDecorations(decorationType, []);
    return;
  }
  
  try {
    const analysisResult: ExtendedAnalysisResult = await analyzer.analyze(document);
    
    const decorations: vscode.DecorationOptions[] = analysisResult.tokens.map(token => ({
      range: new vscode.Range(
        new vscode.Position(token.line, token.character),
        new vscode.Position(token.line, token.character + token.length)
      )
    }));
    
    editor.setDecorations(decorationType, decorations);
  } catch (error) {
    // On error, clear decorations
    editor.setDecorations(decorationType, []);
  }
}

// Update decorations for all visible editors
async function updateAllDecorations() {
  // Dispose old decoration type
  if (decorationType) {
    decorationType.dispose();
  }
  
  // Create new decoration type with current color
  decorationType = createDecorationType();
  
  // Apply to all visible editors
  for (const editor of vscode.window.visibleTextEditors) {
    await applyDecorations(editor);
  }
}

async function handleConfigurationChange() {
  await updateAllDecorations();
}

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Create analyzer
    analyzer = new EmotionAnalyzer();
    
    // Create initial decoration type
    decorationType = createDecorationType();
    
    // Apply decorations to currently active editor
    if (vscode.window.activeTextEditor) {
      await applyDecorations(vscode.window.activeTextEditor);
    }
    
    // Listen for editor changes
    const activeEditorChangeListener = vscode.window.onDidChangeActiveTextEditor(
      async (editor) => {
        if (editor) {
          await applyDecorations(editor);
        }
      }
    );
    
    // Listen for document changes
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
      async (event) => {
        const editor = vscode.window.visibleTextEditors.find(
          (e) => e.document === event.document
        );
        if (editor) {
          await applyDecorations(editor);
        }
      }
    );
    
    // Listen for configuration changes
    const configurationListener = vscode.workspace.onDidChangeConfiguration(
      async (event) => {
        if (event.affectsConfiguration('editor.styledComponentHighlighting.enabled')) {
          await handleConfigurationChange();
        }
      }
    );

    // Register commands
    const clearCacheCommand = vscode.commands.registerCommand(
      "emotionHighlighter.clearCache",
      async () => {
        analyzer.clearCache();
        await updateAllDecorations();
        vscode.window.showInformationMessage("Emotion highlighter cache cleared");
      }
    );

    const toggleStyledHighlightingCommand = vscode.commands.registerCommand(
      "emotionHighlighter.toggleHighlighting",
      async () => {
        const config = vscode.workspace.getConfiguration('editor');
        const current = config.get('styledComponentHighlighting.enabled', true);
        
        await config.update(
          'styledComponentHighlighting.enabled',
          !current,
          vscode.ConfigurationTarget.Global
        );
        
        vscode.window.showInformationMessage(
          `Styled component highlighting ${!current ? 'enabled' : 'disabled'}`
        );
      }
    );

    context.subscriptions.push(
      activeEditorChangeListener,
      documentChangeListener,
      configurationListener,
      clearCacheCommand,
      toggleStyledHighlightingCommand
    );

    // Initialize decorations
    await updateAllDecorations();

    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = "emotionHighlighter.clearCache";
    statusBarItem.tooltip = "Click to clear Emotion highlighter cache";

    const updateStatusBar = () => {
      const color = getConfiguredColor();
      
      if (color) {
        const cacheSize = analyzer?.getCacheSize() || 0;
        const typeCacheSize = analyzer?.getTypeCacheSize() || 0;
        statusBarItem.text = `$(symbol-color) Emotion (${cacheSize}/${typeCacheSize})`;
        statusBarItem.show();
      } else {
        statusBarItem.text = "$(symbol-color) Emotion (disabled)";
        statusBarItem.show();
      }
    };

    // Update status bar initially and on configuration changes
    updateStatusBar();
    const statusBarUpdateListener = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('editor.styledComponentHighlighting.enabled')) {
        updateStatusBar();
      }
    });

    context.subscriptions.push(statusBarItem, statusBarUpdateListener);

    console.log("✅ Emotion Styled Component Highlighter activated");
  } catch (error) {
    console.error("❌ Failed to activate Emotion Styled Component Highlighter:", error);
    vscode.window.showErrorMessage(
      `Failed to activate Emotion Styled Component Highlighter: ${error}`
    );
  }
}

export function deactivate() {
  // Dispose decoration type
  if (decorationType) {
    decorationType.dispose();
  }
  
  console.log("✅ Emotion Styled Component Highlighter deactivated");
}
