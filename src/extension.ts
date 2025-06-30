import * as vscode from "vscode";
import {
  EmotionDocumentRangeSemanticTokenProvider,
  EmotionSemanticTokenProvider,
} from "./tokenProvider";

let tokenProvider: EmotionSemanticTokenProvider;
let rangeTokenProvider: EmotionDocumentRangeSemanticTokenProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log("🚀 EXTENSION ACTIVATION STARTED");
  
  try {
    console.log("Emotion Styled Component Highlighter is now active");
    vscode.window.showInformationMessage("🎉 Emotion Highlighter loaded successfully!");

  // Create token providers
  console.log("📝 Creating token providers...");
  vscode.window.showInformationMessage("📝 Creating token providers...");
  
  try {
    console.log("🔨 Creating EmotionSemanticTokenProvider...");
    console.log("🔨 About to call 'new EmotionSemanticTokenProvider()'");
    tokenProvider = new EmotionSemanticTokenProvider();
    console.log("✅ EmotionSemanticTokenProvider created!");
    vscode.window.showInformationMessage("✅ EmotionSemanticTokenProvider created successfully!");
  } catch (error) {
    console.error(`❌ Failed to create EmotionSemanticTokenProvider:`, error);
    vscode.window.showInformationMessage(`❌ Failed to create EmotionSemanticTokenProvider: ${error}`);
    throw error;
  }
  
  try {
    vscode.window.showInformationMessage("🔨 Creating EmotionDocumentRangeSemanticTokenProvider...");
    rangeTokenProvider = new EmotionDocumentRangeSemanticTokenProvider();
    vscode.window.showInformationMessage("✅ EmotionDocumentRangeSemanticTokenProvider created!");
  } catch (error) {
    vscode.window.showInformationMessage(`❌ Failed to create EmotionDocumentRangeSemanticTokenProvider: ${error}`);
    throw error;
  }

  // Get the semantic token legend
  let legend: vscode.SemanticTokensLegend;
  try {
    vscode.window.showInformationMessage("🔨 Creating token legend...");
    legend = EmotionSemanticTokenProvider.getLegend();
    vscode.window.showInformationMessage(`🏷️ Token legend created with ${legend.tokenTypes.length} types`);
  } catch (error) {
    vscode.window.showInformationMessage(`❌ Failed to create token legend: ${error}`);
    throw error;
  }

  // Register semantic token providers for supported languages
  const supportedLanguages = [
    "typescript",
    "typescriptreact",
    "javascript",
    "javascriptreact",
  ];

  vscode.window.showInformationMessage(`🔧 Registering providers for: ${supportedLanguages.join(', ')}`);

  supportedLanguages.forEach((language) => {
    // Register full document semantic token provider
    const fullDocumentProvider =
      vscode.languages.registerDocumentSemanticTokensProvider(
        { language },
        tokenProvider,
        legend
      );

    // Register range semantic token provider
    const rangeProvider =
      vscode.languages.registerDocumentRangeSemanticTokensProvider(
        { language },
        rangeTokenProvider,
        legend
      );

    context.subscriptions.push(fullDocumentProvider, rangeProvider);
    vscode.window.showInformationMessage(`✅ Registered semantic tokens for: ${language}`);
  });

  vscode.window.showInformationMessage("🎯 All semantic token providers registered!");

  // Register commands
  console.log("📝 Registering commands...");
  const testCommand = vscode.commands.registerCommand(
    "emotionHighlighter.test",
    () => {
      const message = "✅ Emotion Highlighter Extension is ACTIVE!";
      vscode.window.showInformationMessage(message);
      console.log("🚀 Extension test command executed!");
      console.error("🚀 Extension test command executed! (ERROR LEVEL)");
      console.warn("🚀 Extension test command executed! (WARN LEVEL)");
    }
  );
  console.log("✅ Test command registered");

  const testTokensCommand = vscode.commands.registerCommand(
    "emotionHighlighter.testTokens",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor!");
        return;
      }
      
      vscode.window.showInformationMessage(`🧪 Testing tokens for: ${editor.document.fileName} (${editor.document.languageId})`);
      
      try {
        const tokens = await tokenProvider.provideDocumentSemanticTokens(
          editor.document, 
          new vscode.CancellationTokenSource().token
        );
        vscode.window.showInformationMessage(`🎯 Manual test result: ${tokens.data.length} token data points`);
      } catch (error) {
        vscode.window.showInformationMessage(`❌ Manual test failed: ${error}`);
      }
    }
  );

  const clearCacheCommand = vscode.commands.registerCommand(
    "emotionHighlighter.clearCache",
    () => {
      tokenProvider.clearAnalyzerCache();
      vscode.window.showInformationMessage("Emotion highlighter cache cleared");
    }
  );

  const showCacheStatsCommand = vscode.commands.registerCommand(
    "emotionHighlighter.showCacheStats",
    () => {
      const cacheSize = tokenProvider.getAnalyzerCacheSize();
      const typeCacheSize = tokenProvider.getAnalyzerTypeCacheSize();
      vscode.window.showInformationMessage(
        `Emotion highlighter cache: ${cacheSize} analysis entries, ${typeCacheSize} type entries`
      );
    }
  );

  const toggleHighlightingCommand = vscode.commands.registerCommand(
    "emotionHighlighter.toggle",
    async () => {
      const config = vscode.workspace.getConfiguration("emotionHighlighter");
      const currentEnabled = config.get("enabled", true);
      await config.update(
        "enabled",
        !currentEnabled,
        vscode.ConfigurationTarget.Workspace
      );

      const status = !currentEnabled ? "enabled" : "disabled";
      vscode.window.showInformationMessage(`Emotion highlighting ${status}`);

      // Trigger re-analysis of all open documents
      vscode.workspace.textDocuments.forEach((doc) => {
        if (
          [
            "typescript",
            "typescriptreact",
            "javascript",
            "javascriptreact",
          ].includes(doc.languageId)
        ) {
          // Force refresh by emitting a change event
          vscode.languages.setTextDocumentLanguage(doc, doc.languageId);
        }
      });
    }
  );

  const applyColorsCommand = vscode.commands.registerCommand(
    "emotionHighlighter.applyColors",
    async () => {
      const config = vscode.workspace.getConfiguration("emotionHighlighter");
      const highlightColor = config.get("highlightColor", "#FF6B6B");
      const fontStyle = config.get("fontStyle", "normal");
      const underline = config.get("underline", false);

      // Build the style configuration
      const styleConfig: any = {
        foreground: highlightColor,
      };

      if (fontStyle !== "normal") {
        styleConfig.fontStyle = fontStyle;
      }

      if (underline) {
        styleConfig.underline = true;
      }

      const configText = JSON.stringify({
        "editor.semanticTokenColorCustomizations": {
          "rules": {
            "emotionStyledComponent": styleConfig
          }
        }
      }, null, 2);

      // Show options to user
      const choice = await vscode.window.showInformationMessage(
        `🎨 Ready to apply color: ${highlightColor}`,
        "Copy Configuration",
        "Open Settings",
        "Show Instructions"
      );

      if (choice === "Copy Configuration") {
        await vscode.env.clipboard.writeText(configText);
        vscode.window.showInformationMessage(
          "✅ Configuration copied! Paste it into your VS Code settings.json"
        );
      } else if (choice === "Open Settings") {
        vscode.commands.executeCommand("workbench.action.openSettings", "@id:editor.semanticTokenColorCustomizations");
        vscode.window.showInformationMessage(
          "📝 Add your emotion color configuration in the semantic token settings"
        );
      } else if (choice === "Show Instructions") {
        const outputChannel = vscode.window.createOutputChannel("Emotion Color Setup");
        outputChannel.clear();
        outputChannel.appendLine("🎨 EMOTION HIGHLIGHTER - Color Setup Instructions");
        outputChannel.appendLine("");
        outputChannel.appendLine("1. Copy the configuration below:");
        outputChannel.appendLine("");
        outputChannel.appendLine(configText);
        outputChannel.appendLine("");
        outputChannel.appendLine("2. Open VS Code Settings:");
        outputChannel.appendLine("   - Press Ctrl/Cmd + Shift + P");
        outputChannel.appendLine("   - Type: 'Preferences: Open Settings (JSON)'");
        outputChannel.appendLine("   - Press Enter");
        outputChannel.appendLine("");
        outputChannel.appendLine("3. Add the configuration to your settings.json file");
        outputChannel.appendLine("");
        outputChannel.appendLine("4. Save the file - colors will apply immediately!");
        outputChannel.show();
      }
    }
  );

  const showColorConfigCommand = vscode.commands.registerCommand(
    "emotionHighlighter.showColorConfig",
    () => {
      const config = vscode.workspace.getConfiguration("emotionHighlighter");
      const highlightColor = config.get("highlightColor", "#FF6B6B");
      const fontStyle = config.get("fontStyle", "normal");
      const underline = config.get("underline", false);

      // Build the style configuration
      const styleConfig: any = {
        foreground: highlightColor,
      };

      if (fontStyle !== "normal") {
        styleConfig.fontStyle = fontStyle;
      }

      if (underline) {
        styleConfig.underline = true;
      }

      const configText = JSON.stringify({
        "editor.semanticTokenColorCustomizations": {
          "rules": {
            "emotionStyledComponent": styleConfig
          }
        }
      }, null, 2);

      vscode.window.showInformationMessage(
        "Copy this to your VS Code settings.json:",
        "Copy to Clipboard"
      ).then((selection) => {
        if (selection === "Copy to Clipboard") {
          vscode.env.clipboard.writeText(configText);
          vscode.window.showInformationMessage("✅ Configuration copied to clipboard!");
        }
      });

      // Also show in output channel for easy viewing
      const outputChannel = vscode.window.createOutputChannel("Emotion Highlighter Config");
      outputChannel.clear();
      outputChannel.appendLine("Add this to your VS Code settings.json:");
      outputChannel.appendLine("");
      outputChannel.appendLine(configText);
      outputChannel.show();
    }
  );

  const toggleTypeCheckingCommand = vscode.commands.registerCommand(
    "emotionHighlighter.toggleTypeChecking",
    async () => {
      const config = vscode.workspace.getConfiguration("emotionHighlighter");
      const currentEnabled = config.get("useTypeChecking", true);
      await config.update(
        "useTypeChecking",
        !currentEnabled,
        vscode.ConfigurationTarget.Workspace
      );

      const status = !currentEnabled ? "enabled" : "disabled";
      vscode.window.showInformationMessage(`TypeScript type checking ${status}`);

      // Clear cache to force re-analysis with new settings
      tokenProvider.clearAnalyzerCache();

      // Trigger re-analysis of all open documents
      vscode.workspace.textDocuments.forEach((doc) => {
        if (
          [
            "typescript",
            "typescriptreact",
            "javascript",  
            "javascriptreact",
          ].includes(doc.languageId)
        ) {
          // Force refresh by emitting a change event
          vscode.languages.setTextDocumentLanguage(doc, doc.languageId);
        }
      });
    }
  );

  const showTypeCheckingStatsCommand = vscode.commands.registerCommand(
    "emotionHighlighter.showTypeCheckingStats",
    () => {
      const config = vscode.workspace.getConfiguration("emotionHighlighter");
      const useTypeChecking = config.get("useTypeChecking", true);
      const detectImported = config.get("detectImportedComponents", true);
      const cacheEnabled = config.get("typeCheckingCache", true);
      const typeCacheSize = tokenProvider.getAnalyzerTypeCacheSize();

      const message = `TypeScript Type Checking Status:
• Type Checking: ${useTypeChecking ? "Enabled" : "Disabled"}
• Detect Imported Components: ${detectImported ? "Enabled" : "Disabled"}
• Type Cache: ${cacheEnabled ? "Enabled" : "Disabled"}
• Type Cache Entries: ${typeCacheSize}

${useTypeChecking ? 
  "✅ The extension will detect both locally declared and imported styled components using TypeScript type information." :
  "⚠️ The extension will only detect locally declared styled components using AST analysis."
}`;

      vscode.window.showInformationMessage(message, { modal: true });
    }
  );

  context.subscriptions.push(
    testCommand,
    testTokensCommand,
    clearCacheCommand,
    showCacheStatsCommand,
    toggleHighlightingCommand,
    applyColorsCommand,
    showColorConfigCommand,
    toggleTypeCheckingCommand,
    showTypeCheckingStatsCommand
  );
  console.log("✅ All commands registered and added to subscriptions");

  // Listen for configuration changes
  const configurationListener = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("emotionHighlighter")) {
        console.log("Emotion highlighter configuration changed");

        // Clear cache to force re-analysis with new settings
        tokenProvider.clearAnalyzerCache();

        // Trigger re-analysis of all open documents
        vscode.workspace.textDocuments.forEach((doc) => {
          if (
            [
              "typescript",
              "typescriptreact",
              "javascript",
              "javascriptreact",
            ].includes(doc.languageId)
          ) {
            vscode.languages.setTextDocumentLanguage(doc, doc.languageId);
          }
        });
      }
    }
  );

  context.subscriptions.push(configurationListener);

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "emotionHighlighter.showCacheStats";
  statusBarItem.tooltip = "Click to show Emotion highlighter cache statistics";

  const updateStatusBar = () => {
    const config = vscode.workspace.getConfiguration("emotionHighlighter");
    const enabled = config.get("enabled", true);
    const typeChecking = config.get("useTypeChecking", true);

    if (enabled) {
      const cacheSize = tokenProvider?.getAnalyzerCacheSize() || 0;
      const typeCacheSize = tokenProvider?.getAnalyzerTypeCacheSize() || 0;
      const typeIndicator = typeChecking ? "T" : "";
      statusBarItem.text = `$(symbol-color) Emotion${typeIndicator} (${cacheSize}/${typeCacheSize})`;
      statusBarItem.show();
    } else {
      statusBarItem.text = `$(symbol-color) Emotion (disabled)`;
      statusBarItem.show();
    }
  };

  // Update status bar periodically
  const statusBarTimer = setInterval(updateStatusBar, 5000);
  updateStatusBar(); // Initial update

  context.subscriptions.push(statusBarItem, {
    dispose: () => clearInterval(statusBarTimer),
  });

  // Performance monitoring
  if (process.env.NODE_ENV === "development") {
    const performanceCommand = vscode.commands.registerCommand(
      "emotionHighlighter.showPerformanceStats",
      () => {
        // This would show more detailed performance information in development
        vscode.window.showInformationMessage(
          "Performance monitoring is enabled"
        );
      }
    );
    context.subscriptions.push(performanceCommand);
  }

  return {
    // Export API for testing
    tokenProvider,
    rangeTokenProvider,
    clearCache: () => tokenProvider.clearAnalyzerCache(),
    getCacheSize: () => tokenProvider.getAnalyzerCacheSize(),
  };
  
  } catch (error) {
    console.error("❌ EXTENSION ACTIVATION FAILED:", error);
    vscode.window.showInformationMessage(`Emotion Highlighter failed to activate: ${error}`);
    throw error;
  }
}

export function deactivate() {
  console.log("Emotion Styled Component Highlighter is now deactivated");

  // Clean up resources
  if (tokenProvider) {
    tokenProvider.clearAnalyzerCache();
  }
}
