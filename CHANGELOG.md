# Changelog

All notable changes to the "Emotion Styled Component Highlighter" extension will be documented in this file.

## [0.1.0] - 2024-01-01

### Added
- Initial release of the Emotion Styled Component Highlighter extension
- AST-based styled component detection for locally declared components
- Syntax highlighting for emotion styled components in JSX/TSX files
- Support for template literal and object syntax styled components
- Basic caching for performance optimization
- Status bar indicator showing cache statistics
- Configuration via `editor.styledComponentHighlighting.enabled` setting
- Support for custom highlight colors via hex color strings
- Commands for toggling highlighting and clearing cache
- Automatic theme-aware color selection
- Performance optimizations with early exit strategies

### Technical Details
- Uses TypeScript AST parsing for component detection
- Implements VS Code's semantic token API for highlighting
- Supports TypeScript, JavaScript, TSX, and JSX files
- Includes comprehensive test suite with Jest
- Built with TypeScript and modern VS Code extension APIs

### Configuration
- `editor.styledComponentHighlighting.enabled`: Boolean or hex color string
- Default color: `#FF69B4` (theme-aware fallback)
- Supports disabling via `false` setting

### Commands
- `Emotion Highlighter: Clear Cache` - Clear analysis cache
- `Emotion Highlighter: Toggle Styled Component Highlighting` - Toggle highlighting on/off 