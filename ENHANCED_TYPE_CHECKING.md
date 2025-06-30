# Enhanced TypeScript Type Checking for Emotion Styled Components

This document describes the new TypeScript type checking functionality that allows the extension to detect imported styled components using TypeScript's type system.

## 🚀 What's New

### Type-Based Detection
The extension now uses TypeScript's type checker to identify styled components by their type signatures, not just their names. This means:

- ✅ **Detects imported styled components** from other files
- ✅ **Works with re-exported components** 
- ✅ **Identifies complex styled component patterns**
- ✅ **Maintains backward compatibility** with existing AST-based detection

### Dual Detection Strategy
The extension now uses both approaches simultaneously:

1. **AST-Based Detection** (Original): Finds locally declared styled components by analyzing the syntax tree
2. **Type-Based Detection** (New): Uses TypeScript type information to identify any component with `StyledComponent` type

## 🛠 Configuration Options

Add these new settings to your VS Code settings:

```json
{
  "emotionHighlighter.useTypeChecking": true,
  "emotionHighlighter.detectImportedComponents": true,
  "emotionHighlighter.typeCheckingCache": true
}
```

### Settings Explained

| Setting | Default | Description |
|---------|---------|-------------|
| `useTypeChecking` | `true` | Enable TypeScript type information for detection |
| `detectImportedComponents` | `true` | Detect styled components imported from other files |
| `typeCheckingCache` | `true` | Cache type checking results for better performance |

## 🎯 Detection Methods

### Method 1: AST Analysis (Original)
```typescript
// These are detected by analyzing the syntax tree
const Button = styled.button`color: blue;`;
const Container = styled.div`padding: 20px;`;
```

### Method 2: Type Analysis (New)
```typescript
// These are detected by TypeScript type information
import { Card, Header } from './StyledComponents';

// In your JSX:
<Card>          // ✅ Detected by type checking
  <Header />    // ✅ Detected by type checking  
</Card>
```

### Method 3: Combined Detection
```typescript
// Components detected by BOTH methods get highest confidence
const LocalButton = styled.button`...`;

<LocalButton /> // ✅ Detected by both AST + Type = highest confidence
```

## 🔧 Commands

The extension adds new commands accessible via the Command Palette:

### Core Commands
- **`Emotion Highlighter: Toggle TypeScript Type Checking`**
  - Enable/disable type-based detection
  - Useful for debugging or performance tuning

- **`Emotion Highlighter: Show TypeScript Type Checking Stats`**
  - View current configuration and cache statistics
  - Shows detection method breakdown

### Enhanced Existing Commands  
- **`Emotion Highlighter: Show Cache Stats`**
  - Now shows both analysis cache and type cache sizes
  - Format: `X analysis entries, Y type entries`

## 📊 Status Bar Indicator

The status bar now shows enhanced information:

- **`$(symbol-color) Emotion (5/12)`**: AST cache / Type cache entries
- **`$(symbol-color) EmotionT (5/12)`**: The "T" indicates type checking is enabled
- **`$(symbol-color) Emotion (disabled)`**: Extension is disabled

Click the status bar to see detailed cache statistics.

## 🏗 How Type Detection Works

### 1. Type Checker Integration
```typescript
// The extension creates a TypeScript program and type checker
const program = ts.createProgram([document.fileName], compilerOptions);
const typeChecker = program.getTypeChecker();
```

### 2. Type Analysis
```typescript
// For each JSX element, we check its type
const type = typeChecker.getTypeAtLocation(jsxElement);
const isStyledComponent = this.isTypeStyledComponent(type, typeChecker);
```

### 3. Heuristic Detection
The extension uses multiple heuristics to identify styled components:

- **Symbol names** containing "Styled" or "styled"
- **Type strings** containing "StyledComponent", "emotion", or "styled-components"  
- **Type properties** like `withComponent`, `attrs`, `__emotion_real`
- **Return types** that produce JSX elements from styled libraries
- **Source file analysis** to verify origin from emotion/styled-components

## 🚀 Performance Optimizations

### Type Result Caching
- Type checking results are cached for 1 minute
- Cache key includes component name and position
- Automatic cache invalidation on file changes

### Fallback Strategy
- If TypeScript service is unavailable → falls back to AST-only detection
- If type checking fails → graceful degradation with warning
- Configuration allows disabling type checking entirely

### Performance Metrics
Enable development mode to see detailed timing:
```typescript
// Performance logged when total time > 50ms
{
  parseTime: "2.34ms",
  analysisTime: "8.12ms", 
  tokenizationTime: "3.45ms",
  typeCheckingTime: "12.67ms", // New!
  totalTime: "26.58ms"
}
```

## 🧪 Testing the Enhanced Functionality

### Test File Structure
Create a test project with these files:

```
project/
├── components/
│   └── StyledComponents.tsx    // Export styled components
├── pages/
│   └── HomePage.tsx           // Import and use components
└── tsconfig.json              // TypeScript configuration
```

### Example Test Case

**components/StyledComponents.tsx**:
```typescript
import styled from '@emotion/styled';

export const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
`;

export const Button = styled.button`
  background: blue;
  color: white;
`;
```

**pages/HomePage.tsx**:
```typescript
import React from 'react';
import { Card, Button } from '../components/StyledComponents';

export default function HomePage() {
  return (
    <Card>              {/* ✅ Should be highlighted (type detection) */}
      <h1>Welcome</h1>  {/* ❌ Should NOT be highlighted */}
      <Button>          {/* ✅ Should be highlighted (type detection) */}
        Click me
      </Button>  
    </Card>
  );
}
```

### Expected Behavior
1. Open `HomePage.tsx` in VS Code
2. Styled components `<Card>` and `<Button>` should be highlighted
3. Regular HTML elements like `<h1>` should NOT be highlighted
4. Check Command Palette → "Show TypeScript Type Checking Stats" for confirmation

## 🐛 Troubleshooting

### Type Checking Not Working?

1. **Check TypeScript Project**
   - Ensure you have a `tsconfig.json` file
   - Verify TypeScript is installed in your project

2. **Verify Configuration**
   ```json
   {
     "emotionHighlighter.useTypeChecking": true,
     "emotionHighlighter.detectImportedComponents": true
   }
   ```

3. **Clear Cache**
   - Command Palette → "Emotion Highlighter: Clear Cache"
   - Reload VS Code window

4. **Check Console**
   - Open VS Code Developer Tools (Help → Toggle Developer Tools)
   - Look for TypeScript-related error messages

### Performance Issues?

1. **Disable Type Checking Temporarily**
   ```json
   {
     "emotionHighlighter.useTypeChecking": false
   }
   ```

2. **Enable Type Caching**
   ```json
   {
     "emotionHighlighter.typeCheckingCache": true
   }
   ```

3. **Check Performance Stats**
   - Monitor status bar for cache efficiency
   - Use "Show Cache Stats" command

## 🔮 Future Enhancements

### Planned Features
- **Language Server Integration**: Connect to VS Code's built-in TypeScript language service
- **Workspace-wide Analysis**: Analyze entire project for better type resolution
- **Custom Type Definitions**: Support for custom styled component interfaces
- **Performance Dashboard**: Detailed performance monitoring UI

### Advanced Type Patterns
- **Conditional Types**: Better detection of complex conditional styled components
- **Generic Components**: Enhanced support for generic styled components
- **Theme Integration**: Type-aware theme property detection

## 📈 Migration Guide

### Upgrading from AST-Only Version

**No Breaking Changes**: The extension maintains full backward compatibility.

**New Behavior**: 
- More styled components will be detected (imported ones)
- Performance may be slightly slower initially (due to type checking)
- New configuration options available

**Recommended Actions**:
1. Test the extension with your existing projects
2. Adjust configuration if needed for performance
3. Report any issues or unexpected behavior

### Configuration Migration
```json
// Old configuration (still works)
{
  "emotionHighlighter.enabled": true,
  "emotionHighlighter.highlightColor": "#FF6B6B"
}

// Enhanced configuration (recommended)
{
  "emotionHighlighter.enabled": true,
  "emotionHighlighter.highlightColor": "#FF6B6B",
  "emotionHighlighter.useTypeChecking": true,        // New!
  "emotionHighlighter.detectImportedComponents": true, // New!
  "emotionHighlighter.typeCheckingCache": true       // New!
}
```

## 🤝 Contributing

### Testing New Features
1. Create test cases with various styled component patterns
2. Test performance with large TypeScript projects  
3. Report issues with specific code examples

### Development Setup
1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to launch Extension Development Host
5. Test with TypeScript projects

---

**🎉 The enhanced type checking makes this extension significantly more powerful for TypeScript projects with complex styled component architectures!** 