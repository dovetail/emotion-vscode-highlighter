# Emotion Styled Component Highlighter

A powerful Visual Studio Code extension that provides intelligent syntax highlighting for Emotion styled components in TypeScript/JavaScript projects.

## 🚀 Features

### Enhanced TypeScript Type Checking (NEW!)
- **🎯 Detects imported styled components** using TypeScript type information
- **🔍 Dual detection strategy**: Combines AST analysis with type checking
- **⚡ Smart caching** for optimal performance
- **🛡️ Backwards compatible** with existing functionality

### Core Highlighting
- **Highlights emotion styled components** in JSX/TSX files
- **Customizable colors and styles** (color, bold, italic, underline)
- **Supports both template literals and object syntax**
- **Works with styled-components library** as well

### Detection Methods

#### 1. AST-Based Detection (Original)
Detects locally declared styled components:
```typescript
const Button = styled.button`
  background: blue;
  color: white;
`;
```

#### 2. Type-Based Detection (NEW!)
Detects imported styled components using TypeScript:
```typescript
import { Card, Header } from './components/StyledComponents';

// These will be highlighted based on their TypeScript type
<Card>
  <Header />
</Card>
```

## 📦 Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Emotion Styled Component Highlighter"
4. Click Install

Or install from command line:
```bash
code --install-extension emotion-styled-highlighter
```

## ⚙️ Configuration

### Basic Configuration
```json
{
  "emotionHighlighter.enabled": true,
  "emotionHighlighter.highlightColor": "#FF6B6B",
  "emotionHighlighter.fontStyle": "normal",
  "emotionHighlighter.underline": false
}
```

### Enhanced TypeScript Configuration (NEW!)
```json
{
  "emotionHighlighter.useTypeChecking": true,
  "emotionHighlighter.detectImportedComponents": true,
  "emotionHighlighter.typeCheckingCache": true
}
```

### Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `true` | Enable/disable the extension |
| `highlightColor` | `"#FF6B6B"` | Color for highlighted components (hex) |
| `fontStyle` | `"normal"` | Font style: normal, bold, italic, bold italic |
| `underline` | `false` | Add underline to styled components |
| `useTypeChecking` | `true` | **NEW!** Use TypeScript type information |
| `detectImportedComponents` | `true` | **NEW!** Detect imported styled components |
| `typeCheckingCache` | `true` | **NEW!** Cache type checking results |

## 🎯 Supported Patterns

### Local Styled Components
```typescript
import styled from '@emotion/styled';

// Template literal syntax
const Button = styled.button`
  background: blue;
  color: white;
`;

// Object syntax
const Container = styled.div({
  padding: '20px',
  margin: '10px'
});

// Function call syntax
const Input = styled('input')`
  border: 1px solid gray;
`;

// Component extension
const PrimaryButton = styled(Button)`
  background: darkblue;
`;
```

### Imported Styled Components (NEW!)
```typescript
// components/StyledComponents.tsx
export const Card = styled.div`...`;
export const Header = styled.h1`...`;

// pages/HomePage.tsx
import { Card, Header } from '../components/StyledComponents';

function HomePage() {
  return (
    <Card>        {/* ✅ Highlighted via type checking */}
      <Header>    {/* ✅ Highlighted via type checking */}
        Welcome
      </Header>
    </Card>
  );
}
```

### Complex Patterns
```typescript
// With TypeScript generics
const StyledLink = styled.a<{variant: string}>`
  color: ${props => props.variant === 'primary' ? 'blue' : 'gray'};
`;

// Function that returns styled component
function createButton(color: string) {
  return styled.button`background: ${color};`;
}

const DynamicButton = createButton('red');
```

## 🔧 Commands

Access these via Command Palette (Ctrl+Shift+P):

### Core Commands
- **`Emotion Highlighter: Test Extension`** - Verify extension is working
- **`Emotion Highlighter: Toggle Highlighting`** - Enable/disable highlighting
- **`Emotion Highlighter: Clear Cache`** - Clear analysis cache

### Type Checking Commands (NEW!)
- **`Emotion Highlighter: Toggle TypeScript Type Checking`** - Enable/disable type detection
- **`Emotion Highlighter: Show TypeScript Type Checking Stats`** - View configuration and stats
- **`Emotion Highlighter: Show Cache Stats`** - View cache statistics

### Configuration Commands
- **`Emotion Highlighter: Apply Color Settings`** - Apply custom colors
- **`Emotion Highlighter: Show Color Configuration`** - Show current color config

## 📊 Status Bar

The status bar shows real-time information:

- **`$(symbol-color) EmotionT (5/12)`**: Type checking enabled, 5 analysis cache / 12 type cache entries
- **`$(symbol-color) Emotion (5/0)`**: Type checking disabled, 5 analysis cache entries
- **`$(symbol-color) Emotion (disabled)`**: Extension disabled

Click the status bar item to see detailed cache statistics.

## 🧪 Testing

### Test the Extension

1. **Create a test file** (e.g., `test.tsx`):
```typescript
import styled from '@emotion/styled';

const Button = styled.button`
  background: blue;
  color: white;
`;

export default function App() {
  return (
    <div>
      <Button>Styled Button</Button>  {/* Should be highlighted */}
      <button>Regular Button</button>  {/* Should NOT be highlighted */}
    </div>
  );
}
```

2. **Verify highlighting**: The `<Button>` should be highlighted, but `<button>` should not

3. **Test type checking** (create separate files):
   - Export styled components from one file
   - Import and use them in another file
   - Both should be highlighted

### Development Testing

Run in development mode:
```bash
git clone <repository>
cd emotion-vscode-highlighter
npm install
npm run compile
code .
# Press F5 to launch Extension Development Host
```

## 🚀 Performance

### Type Checking Performance
- **Cached results**: Type checking results cached for 1 minute
- **Incremental analysis**: Only re-analyzes changed files
- **Fallback strategy**: Graceful degradation if TypeScript service unavailable
- **Configurable**: Can disable type checking for performance-critical scenarios

### Performance Monitoring
```typescript
// Logged when analysis takes > 50ms
{
  parseTime: "2.34ms",
  analysisTime: "8.12ms",
  tokenizationTime: "3.45ms", 
  typeCheckingTime: "12.67ms",  // NEW!
  totalTime: "26.58ms"
}
```

## 🐛 Troubleshooting

### Common Issues

**Styled components not highlighted?**
1. Check that the file contains emotion imports
2. Verify extension is enabled: `emotionHighlighter.enabled: true`
3. Run "Test Extension" command

**Type checking not working?**
1. Ensure you have a `tsconfig.json` file
2. Verify TypeScript is installed in your project
3. Check configuration: `emotionHighlighter.useTypeChecking: true`
4. Clear cache and reload VS Code

**Performance issues?**
1. Temporarily disable type checking: `useTypeChecking: false`
2. Enable caching: `typeCheckingCache: true`
3. Monitor status bar for cache statistics

### Debug Mode

Enable detailed logging by setting VS Code to debug mode:
```json
{
  "emotionHighlighter.debug": true  // If available in your version
}
```

## 📚 Documentation

- **[Enhanced Type Checking Guide](./ENHANCED_TYPE_CHECKING.md)** - Comprehensive guide to the new type checking features
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Technical implementation details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Setup
```bash
git clone <your-fork>
cd emotion-vscode-highlighter
npm install
npm run compile
code .
# Press F5 to test
```

## 📝 Changelog

### v0.1.0 (Latest)
- ✨ **NEW**: TypeScript type checking for imported styled components
- ✨ **NEW**: Dual detection strategy (AST + Type checking)
- ✨ **NEW**: Smart caching for type checking results
- ✨ **NEW**: Enhanced status bar with type checking indicators
- ✨ **NEW**: Commands for managing type checking
- 🔧 Enhanced performance monitoring
- 📚 Comprehensive documentation

### Previous Versions
- v0.0.x: Initial AST-based styled component detection

## 📄 License

MIT License - see [LICENSE](LICENSE.txt) for details.

## 🙏 Acknowledgments

- Built on top of TypeScript's powerful type system
- Inspired by the Emotion and styled-components communities
- Thanks to the VS Code extension development community

---

**🎉 Now with enhanced TypeScript support - detect ALL your styled components, whether local or imported!**