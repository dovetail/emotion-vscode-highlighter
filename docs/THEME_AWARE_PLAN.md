# 🎨 Theme-Aware Plugin Implementation Plan

## Overview

This document outlines the simplified plan to make the Emotion Styled Component Highlighter plugin theme-aware, using a streamlined configuration approach that automatically adapts colors based on the user's current VS Code theme.

## Current State Analysis

### What We Have Now
- ✅ Fixed color configuration (`#FF6B6B` default)
- ✅ Manual semantic token configuration via `editor.semanticTokenColorCustomizations`
- ✅ User must copy/paste configuration to `settings.json`
- ✅ Works with all semantic highlighting

### What We Want
- 🎯 Simplifying the configuration
- 🎯 Automatic theme detection and color adaptation
- 🎯 Seamless integration without manual configuration
- 🎯 Real-time updates when themes change

## Implementation Phases

### Phase 1: Theme Color Extraction

#### 1.1 Semantic Token Color Detection

**Core function to extract theme colors:**

```typescript
// Theme color extraction utilities
function getSemanticTokenColor(tokenType: string): string | undefined {
  try {
    // Get the current theme's semantic token colors
    const config = vscode.workspace.getConfiguration('editor');
    const semanticTokenColors = config.get('semanticTokenColorCustomizations') as any;
    
    // Look for the token color in theme customizations
    if (semanticTokenColors?.rules?.[tokenType]) {
      return semanticTokenColors.rules[tokenType].foreground;
    }
    
    // Extract from active theme (synchronous theme system access)
    return extractColorFromActiveTheme(tokenType);
  } catch (error) {
    console.error(`Failed to get semantic token color for ${tokenType}:`, error);
    return undefined;
  }
}

function extractColorFromActiveTheme(tokenType: string): string | undefined {
  // Implementation to extract colors from the active theme
  // This will access VSCode's theme system to get semantic token colors
  // for "variable.other.readwrite.js" and "string.quoted"
  // Most theme color access can be synchronous
}
```

#### 1.2 Theme Color Priority System

**Color selection strategy:**

```typescript
function getThemeAwareColor(): string {
  // Priority order: variable.other.readwrite.js → string.quoted → #FF69B4
  
  let color = getSemanticTokenColor('variable.other.readwrite.js');
  if (color) return color;
  
  color = getSemanticTokenColor('string.quoted');
  if (color) return color;
  
  // Final fallback
  return '#FF69B4';
}
```

### Phase 2: Simplified Configuration System

#### 2.1 Single Configuration Setting

**Uses settings.json**

With this setting, or if this property is missing but the plugin is installed, we attempt to apply the theme colour of "variable.other.readwrite.js", then "string.quoted",  then fall back on `#FF69B4`
```json
{  
    "editor.styledComponentHighlighting.enabled": true,
}
```

If instead of a boolean, this property is set to a hex value, we use that as the colour
```json
{  
    "editor.styledComponentHighlighting.enabled": "#FF69B4",
}
```

We do not need other configuration.

#### 2.2 Configuration Logic

```typescript
function getConfiguredColor(): string {
  const config = vscode.workspace.getConfiguration('editor');
  const setting = config.get('styledComponentHighlighting.enabled');
  
  // If disabled, return empty (no highlighting)
  if (setting === false) {
    return '';
  }
  
  // If hex color provided, use it
  if (typeof setting === 'string' && setting.startsWith('#')) {
    return setting;
  }
  
  // If true or missing, use theme-aware color
  if (setting === true || setting === undefined) {
    return getThemeAwareColor();
  }
  
  // Fallback
  return '#FF69B4';
}
```

### Phase 3: Automatic Theme Integration

#### 3.1 Theme Change Detection

```typescript
// Simplified theme change handling
export function setupThemeWatcher(context: vscode.ExtensionContext) {
  const themeWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('workbench.colorTheme') || 
        event.affectsConfiguration('editor.styledComponentHighlighting.enabled')) {
      handleConfigurationChange();
    }
  });
  
  context.subscriptions.push(themeWatcher);
}

async function handleConfigurationChange() {
  const newColor = getConfiguredColor();
  
  if (newColor) {
    await applyHighlightColor(newColor);
  }
}
```

#### 3.2 Automatic Color Application

```typescript
// Note: This function must remain async due to VS Code's config.update() API
async function applyHighlightColor(color: string) {
  // Apply the color to semantic token configuration
  const workspaceConfig = vscode.workspace.getConfiguration();
  
  await workspaceConfig.update(
    'editor.semanticTokenColorCustomizations',
    {
      rules: {
        emotionStyledComponent: {
          foreground: color
        }
      }
    },
    vscode.ConfigurationTarget.Workspace
  );
  
  // Force refresh of all documents
  tokenProvider.clearAnalyzerCache();
  vscode.workspace.textDocuments.forEach((doc) => {
    if (['typescript', 'typescriptreact', 'javascript', 'javascriptreact'].includes(doc.languageId)) {
      tokenProvider.refreshDocument(doc);
    }
  });
}
```

### Phase 4: Simple User Experience

#### 4.1 Basic Commands (Optional)

**Add to `package.json` commands:**

```json
{
  "command": "emotionHighlighter.refreshColors",
  "title": "🎨 Refresh Theme Colors",
  "category": "Emotion Highlighter"
},
{
  "command": "emotionHighlighter.toggleHighlighting",
  "title": "🔄 Toggle Styled Component Highlighting",
  "category": "Emotion Highlighter"
}
```

#### 4.2 Command Implementations

```typescript
// Simple command implementations
async function refreshThemeColors() {
  const color = getThemeAwareColor();
  await applyHighlightColor(color);
  vscode.window.showInformationMessage(`✅ Colors refreshed: ${color}`);
}

async function toggleHighlighting() {
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
```

### Phase 5: Streamlined Implementation

#### 5.1 Minimal File Changes

```
src/
├── extension.ts          (add simple theme integration)
├── tokenProvider.ts      (update config reading)
├── analyzer.ts          (no changes needed)
└── types.ts             (minimal theme-related types)
```

#### 5.2 Package.json Updates

```json
{
  "contributes": {
    "configuration": {
      "title": "Styled Component Highlighting",
      "properties": {
        "editor.styledComponentHighlighting.enabled": {
          "type": ["boolean", "string"],
          "default": true,
          "markdownDescription": "Enable styled component highlighting. Set to `true` for automatic theme colors, `false` to disable, or a hex color like `#FF69B4` for custom color."
        }
      }
    }
  }
}
```

## Synchronous vs Asynchronous Functions

### Synchronous Functions (No Promises)
- `getSemanticTokenColor()` - VS Code configuration reading is synchronous
- `extractColorFromActiveTheme()` - Theme color access can be synchronous  
- `getThemeAwareColor()` - Pure logic, no async operations needed
- `getConfiguredColor()` - Configuration reading is synchronous

### Asynchronous Functions (Required)
- `applyHighlightColor()` - **Must be async** due to `config.update()` returning Promise
- `handleConfigurationChange()` - **Must be async** because it calls `applyHighlightColor()`
- `refreshThemeColors()` - **Must be async** because it calls `applyHighlightColor()`
- `toggleHighlighting()` - **Must be async** because it calls `config.update()`

### Benefits of This Approach
- ✅ **Minimal Promise Usage**: Only async where VS Code APIs require it
- ✅ **Simpler Code**: Synchronous functions are easier to reason about
- ✅ **Better Performance**: No unnecessary Promise overhead
- ✅ **Cleaner Testing**: Synchronous functions are easier to test

## Color Extraction Strategy

### Target Semantic Tokens
1. **Primary**: `variable.other.readwrite.js` - Perfect for styled components
2. **Secondary**: `string.quoted` - Good fallback for string-like highlighting  
3. **Fallback**: `#FF69B4` - Reliable pink that works in all themes

### Theme Compatibility
- **Dark Themes**: Will typically provide good contrast colors
- **Light Themes**: Colors should be darker/more saturated
- **High Contrast**: May need special handling but fallback covers this
- **Custom Themes**: Automatic extraction covers most cases

## Implementation Timeline

### Week 1: Core Implementation
- [ ] Implement semantic token color extraction
- [ ] Add simplified configuration handling
- [ ] Update package.json with new setting
- [ ] Basic theme change detection

### Week 2: Integration & Testing
- [ ] Integrate with existing tokenProvider
- [ ] Test with popular themes (Dark+, Light+, One Dark Pro)
- [ ] Add optional commands
- [ ] Documentation updates

## Testing Strategy

### Essential Tests
- ✅ **Configuration Handling**: Boolean, hex string, and undefined values (synchronous tests)
- ✅ **Theme Color Extraction**: Success and failure cases (synchronous tests)
- ✅ **Popular Themes**: Dark+, Light+, Monokai, One Dark Pro (synchronous color extraction)
- ✅ **Fallback Behavior**: When theme colors unavailable (synchronous logic)

### Edge Cases
- ✅ **Theme Without Semantic Tokens**: Fallback to default (synchronous)
- ✅ **Invalid Hex Colors**: Validation and fallback (synchronous)
- ✅ **Configuration Updates**: VS Code API integration (async tests only where needed)
- ✅ **Rapid Theme Changes**: Event handling (minimal async)

## Success Metrics

1. **Zero Setup**: Works immediately after installation
2. **Theme Harmony**: Colors match the current theme naturally
3. **Reliable Fallbacks**: Always provides some highlighting color
4. **Simple Configuration**: One setting covers all use cases
5. **Performance**: No noticeable impact on editor performance

## Benefits of This Approach

### For Users
- **Instant Gratification**: Works without any configuration
- **Flexibility**: Can still use custom colors if desired
- **Simplicity**: One setting to rule them all
- **Consistency**: Colors match their theme choice

### For Development
- **Maintainable**: Much less complex code
- **Robust**: Fewer failure points
- **Testable**: Simple logic is easier to verify
- **Extensible**: Easy to add more semantic token types later

This simplified approach achieves the core goal of theme awareness while maintaining elegance and reliability. The focus on semantic token colors provides a natural way to extract theme-appropriate colors without complex theme system integration. 