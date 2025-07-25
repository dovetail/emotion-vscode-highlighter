const theme = {
    "name": "Night Owl Light",
    "type": "light",
    "semanticHighlighting": false,
    "colors": {
      // Base
      "foreground": "#403f53",
      "focusBorder": "#93A1A1",
      "errorForeground": "#403f53",
      "selection.background": "#7a8181ad",
      "descriptionForeground": "#403f53",
      "widget.shadow": "#d9d9d9",
      "titleBar.activeBackground": "#F0F0F0",
      // Notifications
      "notifications.background": "#F0F0F0",
      "notifications.foreground": "#403f53",
      "notificationLink.foreground": "#994cc3",
      "notifications.border": "#CCCCCC",
      "notificationCenter.border": "#CCCCCC",
      "notificationToast.border": "#CCCCCC",
      "notificationCenterHeader.foreground": "#403f53",
      "notificationCenterHeader.background": "#F0F0F0",
      // Buttons
      "button.background": "#2AA298",
      "button.foreground": "#F0F0F0",
      // Dropdown
      "dropdown.background": "#F0F0F0",
      "dropdown.foreground": "#403f53",
      "dropdown.border": "#d9d9d9",
      // Input
      "input.background": "#F0F0F0",
      "input.foreground": "#403f53",
      "input.border": "#d9d9d9",
      "input.placeholderForeground": "#93A1A1",
      "inputOption.activeBorder": "#2AA298",
      "inputValidation.infoBorder": "#D0D0D0",
      "inputValidation.infoBackground": "#F0F0F0",
      "inputValidation.warningBackground": "#daaa01",
      "inputValidation.warningBorder": "#E0AF02",
      "inputValidation.errorBackground": "#f76e6e",
      "inputValidation.errorBorder": "#de3d3b",
      // Badge
      "badge.background": "#2AA298",
      "badge.foreground": "#F0F0F0",
      // Progress Bar
      "progressBar.background": "#2AA298",
      // List and Trees
      "list.activeSelectionBackground": "#d3e8f8",
      "list.activeSelectionForeground": "#403f53",
      "list.inactiveSelectionBackground": "#E0E7EA",
      "list.inactiveSelectionForeground": "#403f53",
      "list.focusBackground": "#d3e8f8",
      "list.hoverBackground": "#d3e8f8",
      "list.focusForeground": "#403f53",
      "list.hoverForeground": "#403f53",
      "list.highlightForeground": "#403f53",
      "list.errorForeground": "#E64D49",
      "list.warningForeground": "#daaa01",
      // Activity Bar
      "activityBar.background": "#F0F0F0",
      "activityBar.foreground": "#403f53",
      "activityBar.dropBackground": "#D0D0D0",
      "activityBarBadge.background": "#403f53",
      "activityBarBadge.foreground": "#F0F0F0",
      "activityBar.border": "#F0F0F0",
      // Side Bar
      "sideBar.background": "#F0F0F0",
      "sideBar.foreground": "#403f53",
      "sideBarTitle.foreground": "#403f53",
      "sideBar.border": "#F0F0F0",
      // Scroll Bar
      "scrollbar.shadow": "#CCCCCC",
      // Tabs
      "tab.border": "#F0F0F0",
      "tab.activeBackground": "#F6F6F6",
      "tab.activeForeground": "#403f53",
      "tab.inactiveForeground": "#403f53",
      "tab.inactiveBackground": "#F0F0F0",
      "editorGroup.border": "#F0F0F0",
      "editorGroup.background": "#F6F6F6",
      "editorGroupHeader.tabsBackground": "#F0F0F0",
      "editorGroupHeader.tabsBorder": "#F0F0F0",
      "editorGroupHeader.noTabsBackground": "#F0F0F0",
      "tab.activeModifiedBorder": "#2AA298",
      "tab.inactiveModifiedBorder": "#93A1A1",
      "tab.unfocusedActiveModifiedBorder": "#93A1A1",
      "tab.unfocusedInactiveModifiedBorder": "#93A1A1",
      // Editor
      "editor.background": "#FBFBFB",
      "editor.foreground": "#403f53",
      "editorCursor.foreground": "#90A7B2",
      "editorLineNumber.foreground": "#90A7B2",
      "editorLineNumber.activeForeground": "#403f53",
      "editor.selectionBackground": "#E0E0E0",
      "editor.selectionHighlightBackground": "#339cec33",
      "editor.wordHighlightBackground": "#339cec33",
      "editor.wordHighlightStrongBackground": "#007dd659",
      "editor.findMatchBackground": "#93A1A16c",
      "editor.findMatchHighlightBackground": "#93a1a16c",
      "editor.findRangeHighlightBackground": "#7497a633",
      "editor.hoverHighlightBackground": "#339cec33",
      "editor.lineHighlightBackground": "#F0F0F0",
      "editor.rangeHighlightBackground": "#7497a633",
      "editorWhitespace.foreground": "#d9d9d9",
      "editorIndentGuide.background": "#d9d9d9",
      "editorCodeLens.foreground": "#403f53",
      "editorError.foreground": "#E64D49",
      "editorError.border": "#FBFBFB",
      "editorWarning.foreground": "#daaa01",
      "editorWarning.border": "#daaa01",
      "editorGutter.addedBackground": "#49d0c5",
      "editorGutter.modifiedBackground": "#6fbef6",
      "editorGutter.deletedBackground": "#f76e6e",
      "editorRuler.foreground": "#d9d9d9",
      "editorOverviewRuler.errorForeground": "#E64D49",
      "editorOverviewRuler.warningForeground": "#daaa01",
      "editorInlayHint.background": "#F0F0F0",
      "editorInlayHint.foreground": "#403f53",
      // Editor Widget
      "editorWidget.background": "#F0F0F0",
      "editorWidget.border": "#d9d9d9",
      "editorSuggestWidget.background": "#F0F0F0",
      "editorSuggestWidget.foreground": "#403f53",
      "editorSuggestWidget.highlightForeground": "#403f53",
      "editorSuggestWidget.selectedBackground": "#d3e8f8",
      "editorSuggestWidget.border": "#d9d9d9",
      "editorHoverWidget.background": "#F0F0F0",
      "editorHoverWidget.border": "#d9d9d9",
      "debugExceptionWidget.background": "#F0F0F0",
      "debugExceptionWidget.border": "#d9d9d9",
      "editorMarkerNavigation.background": "#D0D0D0",
      "editorMarkerNavigationError.background": "#f76e6e",
      "editorMarkerNavigationWarning.background": "#daaa01",
      // Debug
      "debugToolBar.background": "#F0F0F0",
      // Picker Group
      "pickerGroup.border": "#d9d9d9",
      "pickerGroup.foreground": "#403f53",
      // Extension
      "extensionButton.prominentBackground": "#2AA298",
      "extensionButton.prominentForeground": "#F0F0F0",
      // Status Bar
      "statusBar.background": "#F0F0F0",
      "statusBar.border": "#F0F0F0",
      "statusBar.debuggingBackground": "#F0F0F0",
      "statusBar.debuggingForeground": "#403f53",
      "statusBar.foreground": "#403f53",
      "statusBar.noFolderBackground": "#F0F0F0",
      "statusBar.noFolderForeground": "#403f53",
      // Panel
      "panel.background": "#F0F0F0",
      "panel.border": "#d9d9d9",
      // Peek View
      "peekView.border": "#d9d9d9",
      "peekViewEditor.background": "#F6F6F6",
      "peekViewEditorGutter.background": "#F6F6F6",
      "peekViewEditor.matchHighlightBackground": "#49d0c5",
      "peekViewResult.background": "#F0F0F0",
      "peekViewResult.fileForeground": "#403f53",
      "peekViewResult.lineForeground": "#403f53",
      "peekViewResult.matchHighlightBackground": "#49d0c5",
      "peekViewResult.selectionBackground": "#E0E7EA",
      "peekViewResult.selectionForeground": "#403f53",
      "peekViewTitle.background": "#F0F0F0",
      "peekViewTitleLabel.foreground": "#403f53",
      "peekViewTitleDescription.foreground": "#403f53",
      // Terminal
      "terminal.ansiBrightBlack": "#403f53",
      "terminal.ansiBlack": "#403f53",
      "terminal.ansiBrightBlue": "#288ed7",
      "terminal.ansiBlue": "#288ed7",
      "terminal.ansiBrightCyan": "#2AA298",
      "terminal.ansiCyan": "#2AA298",
      "terminal.ansiBrightGreen": "#08916a",
      "terminal.ansiGreen": "#08916a",
      "terminal.ansiBrightMagenta": "#d6438a",
      "terminal.ansiMagenta": "#d6438a",
      "terminal.ansiBrightRed": "#de3d3b",
      "terminal.ansiRed": "#de3d3b",
      "terminal.ansiBrightWhite": "#93A1A1",
      "terminal.ansiWhite": "#93A1A1",
      "terminal.ansiBrightYellow": "#daaa01",
      "terminal.ansiYellow": "#E0AF02",
      "terminal.background": "#F6F6F6",
      "terminal.foreground": "#403f53"
    },
    "tokenColors": [
      {
        "name": "Changed",
        "scope": [
          "markup.changed",
          "meta.diff.header.git",
          "meta.diff.header.from-file",
          "meta.diff.header.to-file"
        ],
        "settings": {
          "foreground": "#a2bffc",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Deleted",
        "scope": "markup.deleted.diff",
        "settings": {
          "foreground": "#EF535090",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Inserted",
        "scope": "markup.inserted.diff",
        "settings": {
          "foreground": "#4876d6ff",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Global settings",
        "settings": {
          "background": "#011627",
          "foreground": "#403f53"
        }
      },
      {
        "name": "Comment",
        "scope": ["comment", "punctuation.definition.comment"],
        "settings": {
          "foreground": "#989fb1",
          "fontStyle": "italic"
        }
      },
      {
        "name": "String",
        "scope": "string",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "String Quoted",
        "scope": ["string.quoted", "variable.other.readwrite.js"],
        "settings": {
          "foreground": "#c96765"
        }
      },
      {
        "name": "Support Constant Math",
        "scope": "support.constant.math",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Number",
        "scope": ["constant.numeric", "constant.character.numeric"],
        "settings": {
          "foreground": "#aa0982",
          "fontStyle": ""
        }
      },
      {
        "name": "Built-in constant",
        "scope": [
          "constant.language",
          "punctuation.definition.constant",
          "variable.other.constant"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "User-defined constant",
        "scope": ["constant.character", "constant.other"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Constant Character Escape",
        "scope": "constant.character.escape",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "RegExp String",
        "scope": ["string.regexp", "string.regexp keyword.other"],
        "settings": {
          "foreground": "#5ca7e4"
        }
      },
      {
        "name": "Comma in functions",
        "scope": "meta.function punctuation.separator.comma",
        "settings": {
          "foreground": "#5f7e97"
        }
      },
      {
        "name": "Variable",
        "scope": "variable",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Keyword",
        "scope": ["punctuation.accessor", "keyword"],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Storage",
        "scope": [
          "storage",
          "meta.var.expr",
          "meta.class meta.method.declaration meta.var.expr storage.type.js",
          "storage.type.property.js",
          "storage.type.property.ts",
          "storage.type.property.tsx"
        ],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Storage type",
        "scope": "storage.type",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "Storage type",
        "scope": "storage.type.function.arrow.js",
        "settings": {
          "fontStyle": ""
        }
      },
      {
        "name": "Class name",
        "scope": ["entity.name.class", "meta.class entity.name.type.class"],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Inherited class",
        "scope": "entity.other.inherited-class",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Function name",
        "scope": "entity.name.function",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Meta Tag",
        "scope": ["punctuation.definition.tag", "meta.tag"],
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "HTML Tag names",
        "scope": [
          "entity.name.tag",
          "meta.tag.other.html",
          "meta.tag.other.js",
          "meta.tag.other.tsx",
          "entity.name.tag.tsx",
          "entity.name.tag.js",
          "entity.name.tag",
          "meta.tag.js",
          "meta.tag.tsx",
          "meta.tag.html"
        ],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": ""
        }
      },
      {
        "name": "Tag attribute",
        "scope": "entity.other.attribute-name",
        "settings": {
          "fontStyle": "italic",
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Entity Name Tag Custom",
        "scope": "entity.name.tag.custom",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Library (function & constant)",
        "scope": ["support.function", "support.constant"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Support Constant Property Value meta",
        "scope": "support.constant.meta.property-value",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Library class/type",
        "scope": ["support.type", "support.class"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Support Variable DOM",
        "scope": "support.variable.dom",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Invalid",
        "scope": "invalid",
        "settings": {
          "foreground": "#ff2c83"
        }
      },
      {
        "name": "Invalid deprecated",
        "scope": "invalid.deprecated",
        "settings": {
          "foreground": "#d3423e"
        }
      },
      {
        "name": "Keyword Operator",
        "scope": "keyword.operator",
        "settings": {
          "foreground": "#0c969b",
          "fontStyle": ""
        }
      },
      {
        "name": "Keyword Operator Relational",
        "scope": "keyword.operator.relational",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Keyword Operator Assignment",
        "scope": "keyword.operator.assignment",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "Keyword Operator Arithmetic",
        "scope": "keyword.operator.arithmetic",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "Keyword Operator Bitwise",
        "scope": "keyword.operator.bitwise",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "Keyword Operator Increment",
        "scope": "keyword.operator.increment",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "Keyword Operator Ternary",
        "scope": "keyword.operator.ternary",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "Double-Slashed Comment",
        "scope": "comment.line.double-slash",
        "settings": {
          "foreground": "#939dbb"
        }
      },
      {
        "name": "Object",
        "scope": "object",
        "settings": {
          "foreground": "#cdebf7"
        }
      },
      {
        "name": "Null",
        "scope": "constant.language.null",
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "Meta Brace",
        "scope": "meta.brace",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Meta Delimiter Period",
        "scope": "meta.delimiter.period",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Punctuation Definition String",
        "scope": "punctuation.definition.string",
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Punctuation Definition String Markdown",
        "scope": "punctuation.definition.string.begin.markdown",
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "Boolean",
        "scope": "constant.language.boolean",
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "Object Comma",
        "scope": "object.comma",
        "settings": {
          "foreground": "#ffffff"
        }
      },
      {
        "name": "Variable Parameter Function",
        "scope": "variable.parameter.function",
        "settings": {
          "foreground": "#0c969b",
          "fontStyle": ""
        }
      },
      {
        "name": "Support Type Property Name & entity name tags",
        "scope": [
          "support.type.vendor.property-name",
          "support.constant.vendor.property-value",
          "support.type.property-name",
          "meta.property-list entity.name.tag"
        ],
        "settings": {
          "foreground": "#0c969b",
          "fontStyle": ""
        }
      },
      {
        "name": "Entity Name tag reference in stylesheets",
        "scope": "meta.property-list entity.name.tag.reference",
        "settings": {
          "foreground": "#57eaf1"
        }
      },
      {
        "name": "Constant Other Color RGB Value Punctuation Definition Constant",
        "scope": "constant.other.color.rgb-value punctuation.definition.constant",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Constant Other Color",
        "scope": "constant.other.color",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Keyword Other Unit",
        "scope": "keyword.other.unit",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Meta Selector",
        "scope": "meta.selector",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Entity Other Attribute Name Id",
        "scope": "entity.other.attribute-name.id",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Meta Property Name",
        "scope": "meta.property-name",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Doctypes",
        "scope": ["entity.name.tag.doctype", "meta.tag.sgml.doctype"],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Punctuation Definition Parameters",
        "scope": "punctuation.definition.parameters",
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Keyword Control Operator",
        "scope": "keyword.control.operator",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Keyword Operator Logical",
        "scope": "keyword.operator.logical",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": ""
        }
      },
      {
        "name": "Variable Instances",
        "scope": [
          "variable.instance",
          "variable.other.instance",
          "variable.readwrite.instance",
          "variable.other.readwrite.instance",
          "variable.other.property"
        ],
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Variable Property Other object property",
        "scope": ["variable.other.object.property"],
        "settings": {
          "foreground": "#111111",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Variable Property Other object",
        "scope": ["variable.other.object.js"],
        "settings": {
          "fontStyle": ""
        }
      },
      {
        "name": "Entity Name Function",
        "scope": ["entity.name.function"],
        "settings": {
          "foreground": "#4876d6",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Keyword Operator Comparison, imports, returns and Keyword Operator Ruby",
        "scope": [
          "keyword.operator.comparison",
          "keyword.control.flow.js",
          "keyword.control.flow.ts",
          "keyword.control.flow.tsx",
          "keyword.control.ruby",
          "keyword.control.module.ruby",
          "keyword.control.class.ruby",
          "keyword.control.def.ruby",
          "keyword.control.loop.js",
          "keyword.control.loop.ts",
          "keyword.control.import.js",
          "keyword.control.import.ts",
          "keyword.control.import.tsx",
          "keyword.control.from.js",
          "keyword.control.from.ts",
          "keyword.control.from.tsx",
          "keyword.operator.instanceof.js",
          "keyword.operator.expression.instanceof.ts",
          "keyword.operator.expression.instanceof.tsx"
        ],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Keyword Control Conditional",
        "scope": [
          "keyword.control.conditional.js",
          "keyword.control.conditional.ts",
          "keyword.control.switch.js",
          "keyword.control.switch.ts"
        ],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": ""
        }
      },
      {
        "name": "Support Constant, `new` keyword, Special Method Keyword, `debugger`, other keywords",
        "scope": [
          "support.constant",
          "keyword.other.special-method",
          "keyword.other.new",
          "keyword.other.debugger",
          "keyword.control"
        ],
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Support Function",
        "scope": "support.function",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Invalid Broken",
        "scope": "invalid.broken",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Invalid Unimplemented",
        "scope": "invalid.unimplemented",
        "settings": {
          "foreground": "#8BD649"
        }
      },
      {
        "name": "Invalid Illegal",
        "scope": "invalid.illegal",
        "settings": {
          "foreground": "#c96765"
        }
      },
      {
        "name": "Language Variable",
        "scope": "variable.language",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Support Variable Property",
        "scope": "support.variable.property",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Variable Function",
        "scope": "variable.function",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Variable Interpolation",
        "scope": "variable.interpolation",
        "settings": {
          "foreground": "#ec5f67"
        }
      },
      {
        "name": "Meta Function Call",
        "scope": "meta.function-call",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Punctuation Section Embedded",
        "scope": "punctuation.section.embedded",
        "settings": {
          "foreground": "#d3423e"
        }
      },
      {
        "name": "Punctuation Tweaks",
        "scope": [
          "punctuation.terminator.expression",
          "punctuation.definition.arguments",
          "punctuation.definition.array",
          "punctuation.section.array",
          "meta.array"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "More Punctuation Tweaks",
        "scope": [
          "punctuation.definition.list.begin",
          "punctuation.definition.list.end",
          "punctuation.separator.arguments",
          "punctuation.definition.list"
        ],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Template Strings",
        "scope": "string.template meta.template.expression",
        "settings": {
          "foreground": "#d3423e"
        }
      },
      {
        "name": "Backtics(``) in Template Strings",
        "scope": "string.template punctuation.definition.string",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Italics",
        "scope": "italic",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Bold",
        "scope": "bold",
        "settings": {
          "foreground": "#4876d6",
          "fontStyle": "bold"
        }
      },
      {
        "name": "Quote",
        "scope": "quote",
        "settings": {
          "foreground": "#697098",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Raw Code",
        "scope": "raw",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "CoffeScript Variable Assignment",
        "scope": "variable.assignment.coffee",
        "settings": {
          "foreground": "#31e1eb"
        }
      },
      {
        "name": "CoffeScript Parameter Function",
        "scope": "variable.parameter.function.coffee",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "CoffeeScript Assignments",
        "scope": "variable.assignment.coffee",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "C# Readwrite Variables",
        "scope": "variable.other.readwrite.cs",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "C# Classes & Storage types",
        "scope": ["entity.name.type.class.cs", "storage.type.cs"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "C# Namespaces",
        "scope": "entity.name.type.namespace.cs",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Tag names in Stylesheets",
        "scope": [
          "entity.name.tag.css",
          "entity.name.tag.less",
          "entity.name.tag.custom.css",
          "support.constant.property-value.css"
        ],
        "settings": {
          "foreground": "#c96765",
          "fontStyle": ""
        }
      },
      {
        "name": "Wildcard(*) selector in Stylesheets",
        "scope": [
          "entity.name.tag.wildcard.css",
          "entity.name.tag.wildcard.less",
          "entity.name.tag.wildcard.scss",
          "entity.name.tag.wildcard.sass"
        ],
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "CSS Keyword Other Unit",
        "scope": "keyword.other.unit.css",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Attribute Name for CSS",
        "scope": [
          "meta.attribute-selector.css entity.other.attribute-name.attribute",
          "variable.other.readwrite.js"
        ],
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Elixir Classes",
        "scope": [
          "source.elixir support.type.elixir",
          "source.elixir meta.module.elixir entity.name.class.elixir"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Elixir Functions",
        "scope": "source.elixir entity.name.function",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Elixir Constants",
        "scope": [
          "source.elixir constant.other.symbol.elixir",
          "source.elixir constant.other.keywords.elixir"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Elixir String Punctuations",
        "scope": "source.elixir punctuation.definition.string",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Elixir",
        "scope": [
          "source.elixir variable.other.readwrite.module.elixir",
          "source.elixir variable.other.readwrite.module.elixir punctuation.definition.variable.elixir"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Elixir Binary Punctuations",
        "scope": "source.elixir .punctuation.binary.elixir",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Closure Constant Keyword",
        "scope": "constant.keyword.clojure",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Go Function Calls",
        "scope": "source.go meta.function-call.go",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Go Keywords",
        "scope": [
          "source.go keyword.package.go",
          "source.go keyword.import.go",
          "source.go keyword.function.go",
          "source.go keyword.type.go",
          "source.go keyword.struct.go",
          "source.go keyword.interface.go",
          "source.go keyword.const.go",
          "source.go keyword.var.go",
          "source.go keyword.map.go",
          "source.go keyword.channel.go",
          "source.go keyword.control.go"
        ],
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Go Constants e.g. nil, string format (%s, %d, etc.)",
        "scope": [
          "source.go constant.language.go",
          "source.go constant.other.placeholder.go"
        ],
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "C++ Functions",
        "scope": [
          "entity.name.function.preprocessor.cpp",
          "entity.scope.name.cpp"
        ],
        "settings": {
          "foreground": "#0c969bff"
        }
      },
      {
        "name": "C++ Meta Namespace",
        "scope": ["meta.namespace-block.cpp"],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "C++ Language Primitive Storage",
        "scope": ["storage.type.language.primitive.cpp"],
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "C++ Preprocessor Macro",
        "scope": ["meta.preprocessor.macro.cpp"],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "C++ Variable Parameter",
        "scope": ["variable.parameter"],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Powershell Variables",
        "scope": ["variable.other.readwrite.powershell"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Powershell Function",
        "scope": ["support.function.powershell"],
        "settings": {
          "foreground": "#0c969bff"
        }
      },
      {
        "name": "ID Attribute Name in HTML",
        "scope": "entity.other.attribute-name.id.html",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "HTML Punctuation Definition Tag",
        "scope": "punctuation.definition.tag.html",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "HTML Doctype",
        "scope": "meta.tag.sgml.doctype.html",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "JavaScript Classes",
        "scope": "meta.class entity.name.type.class.js",
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "JavaScript Method Declaration e.g. `constructor`",
        "scope": "meta.method.declaration storage.type.js",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "JavaScript Terminator",
        "scope": "terminator.js",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "JavaScript Meta Punctuation Definition",
        "scope": "meta.js punctuation.definition.js",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Entity Names in Code Documentations",
        "scope": [
          "entity.name.type.instance.jsdoc",
          "entity.name.type.instance.phpdoc"
        ],
        "settings": {
          "foreground": "#5f7e97"
        }
      },
      {
        "name": "Other Variables in Code Documentations",
        "scope": ["variable.other.jsdoc", "variable.other.phpdoc"],
        "settings": {
          "foreground": "#78ccf0"
        }
      },
      {
        "name": "JavaScript module imports and exports",
        "scope": [
          "variable.other.meta.import.js",
          "meta.import.js variable.other",
          "variable.other.meta.export.js",
          "meta.export.js variable.other"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "JavaScript Variable Parameter Function",
        "scope": "variable.parameter.function.js",
        "settings": {
          "foreground": "#7986E7"
        }
      },
      {
        "name": "JavaScript[React] Variable Other Object",
        "scope": [
          "variable.other.object.js",
          "variable.other.object.jsx",
          "variable.object.property.js",
          "variable.object.property.jsx"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "JavaScript Variables",
        "scope": ["variable.js", "variable.other.js"],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "JavaScript Entity Name Type",
        "scope": ["entity.name.type.js", "entity.name.type.module.js"],
        "settings": {
          "foreground": "#111111",
          "fontStyle": ""
        }
      },
      {
        "name": "JavaScript Support Classes",
        "scope": "support.class.js",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "JSON Property Names",
        "scope": "support.type.property-name.json",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "JSON Support Constants",
        "scope": "support.constant.json",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "JSON Property values (string)",
        "scope": "meta.structure.dictionary.value.json string.quoted.double",
        "settings": {
          "foreground": "#c789d6"
        }
      },
      {
        "name": "Strings in JSON values",
        "scope": "string.quoted.double.json punctuation.definition.string.json",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Specific JSON Property values like null",
        "scope": "meta.structure.dictionary.json meta.structure.dictionary.value constant.language",
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "JavaScript Other Variable",
        "scope": "variable.other.object.js",
        "settings": {
          "foreground": "#0c969b",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Ruby Variables",
        "scope": ["variable.other.ruby"],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Ruby Class",
        "scope": ["entity.name.type.class.ruby"],
        "settings": {
          "foreground": "#c96765"
        }
      },
      {
        "name": "Ruby Hashkeys",
        "scope": "constant.language.symbol.hashkey.ruby",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Ruby Symbols",
        "scope": "constant.language.symbol.ruby",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "LESS Tag names",
        "scope": "entity.name.tag.less",
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "LESS Keyword Other Unit",
        "scope": "keyword.other.unit.css",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Attribute Name for LESS",
        "scope": "meta.attribute-selector.less entity.other.attribute-name.attribute",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Markdown Headings",
        "scope": [
          "markup.heading",
          "markup.heading.setext.1",
          "markup.heading.setext.2"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Markdown Italics",
        "scope": "markup.italic",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Markdown Bold",
        "scope": "markup.bold",
        "settings": {
          "foreground": "#4876d6",
          "fontStyle": "bold"
        }
      },
      {
        "name": "Markdown Quote + others",
        "scope": "markup.quote",
        "settings": {
          "foreground": "#697098",
          "fontStyle": "italic"
        }
      },
      {
        "name": "Markdown Raw Code + others",
        "scope": "markup.inline.raw",
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Markdown Links",
        "scope": [
          "markup.underline.link",
          "markup.underline.link.image"
        ],
        "settings": {
          "foreground": "#ff869a"
        }
      },
      {
        "name": "Markdown Link Title and Description",
        "scope": [
          "string.other.link.title.markdown",
          "string.other.link.description.markdown"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Markdown Punctuation",
        "scope": [
          "punctuation.definition.string.markdown",
          "punctuation.definition.string.begin.markdown",
          "punctuation.definition.string.end.markdown",
          "meta.link.inline.markdown punctuation.definition.string"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Markdown MetaData Punctuation",
        "scope": ["punctuation.definition.metadata.markdown"],
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Markdown List Punctuation",
        "scope": ["beginning.punctuation.definition.list.markdown"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Markdown Inline Raw String",
        "scope": "markup.inline.raw.string.markdown",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "PHP Variables",
        "scope": ["variable.other.php", "variable.other.property.php"],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Support Classes in PHP",
        "scope": "support.class.php",
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Punctuations in PHP function calls",
        "scope": "meta.function-call.php punctuation",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "PHP Global Variables",
        "scope": "variable.other.global.php",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Declaration Punctuation in PHP Global Variables",
        "scope": "variable.other.global.php punctuation.definition.variable",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Language Constants in Python",
        "scope": "constant.language.python",
        "settings": {
          "foreground": "#bc5454"
        }
      },
      {
        "name": "Python Function Parameter and Arguments",
        "scope": [
          "variable.parameter.function.python",
          "meta.function-call.arguments.python"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Python Function Call",
        "scope": [
          "meta.function-call.python",
          "meta.function-call.generic.python"
        ],
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "Punctuations in Python",
        "scope": "punctuation.python",
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Decorator Functions in Python",
        "scope": "entity.name.function.decorator.python",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Python Language Variable",
        "scope": "source.python variable.language.special",
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Python import control keyword",
        "scope": "keyword.control",
        "settings": {
          "foreground": "#994cc3",
          "fontStyle": "italic"
        }
      },
      {
        "name": "SCSS Variable",
        "scope": [
          "variable.scss",
          "variable.sass",
          "variable.parameter.url.scss",
          "variable.parameter.url.sass"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Variables in SASS At-Rules",
        "scope": [
          "source.css.scss meta.at-rule variable",
          "source.css.sass meta.at-rule variable"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "Variables in SASS At-Rules",
        "scope": [
          "source.css.scss meta.at-rule variable",
          "source.css.sass meta.at-rule variable"
        ],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "Attribute Name for SASS",
        "scope": [
          "meta.attribute-selector.scss entity.other.attribute-name.attribute",
          "meta.attribute-selector.sass entity.other.attribute-name.attribute"
        ],
        "settings": {
          "foreground": "#aa0982"
        }
      },
      {
        "name": "Tag names in SASS",
        "scope": ["entity.name.tag.scss", "entity.name.tag.sass"],
        "settings": {
          "foreground": "#0c969b"
        }
      },
      {
        "name": "SASS Keyword Other Unit",
        "scope": ["keyword.other.unit.scss", "keyword.other.unit.sass"],
        "settings": {
          "foreground": "#994cc3"
        }
      },
      {
        "name": "TypeScript[React] Variables and Object Properties",
        "scope": [
          "variable.other.readwrite.alias.ts",
          "variable.other.readwrite.alias.tsx",
          "variable.other.readwrite.ts",
          "variable.other.readwrite.tsx",
          "variable.other.object.ts",
          "variable.other.object.tsx",
          "variable.object.property.ts",
          "variable.object.property.tsx",
          "variable.other.ts",
          "variable.other.tsx",
          "variable.tsx",
          "variable.ts"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "TypeScript[React] Entity Name Types",
        "scope": ["entity.name.type.ts", "entity.name.type.tsx"],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "TypeScript[React] Node Classes",
        "scope": ["support.class.node.ts", "support.class.node.tsx"],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "TypeScript[React] Entity Name Types as Parameters",
        "scope": [
          "meta.type.parameters.ts entity.name.type",
          "meta.type.parameters.tsx entity.name.type"
        ],
        "settings": {
          "foreground": "#5f7e97"
        }
      },
      {
        "name": "TypeScript[React] Import/Export Punctuations",
        "scope": [
          "meta.import.ts punctuation.definition.block",
          "meta.import.tsx punctuation.definition.block",
          "meta.export.ts punctuation.definition.block",
          "meta.export.tsx punctuation.definition.block"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "TypeScript[React] Punctuation Decorators",
        "scope": [
          "meta.decorator punctuation.decorator.ts",
          "meta.decorator punctuation.decorator.tsx"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "TypeScript[React] Punctuation Decorators",
        "scope": "meta.tag.js meta.jsx.children.tsx",
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "YAML Entity Name Tags",
        "scope": "entity.name.tag.yaml",
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "JavaScript Variable Other ReadWrite",
        "scope": ["variable.other.readwrite.js", "variable.parameter"],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "Support Class Component",
        "scope": ["support.class.component.js", "support.class.component.tsx"],
        "settings": {
          "foreground": "#aa0982",
          "fontStyle": ""
        }
      },
      {
        "name": "Text nested in React tags",
        "scope": [
          "meta.jsx.children",
          "meta.jsx.children.js",
          "meta.jsx.children.tsx"
        ],
        "settings": {
          "foreground": "#403f53"
        }
      },
      {
        "name": "TypeScript Classes",
        "scope": "meta.class entity.name.type.class.tsx",
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "TypeScript Entity Name Type",
        "scope": ["entity.name.type.tsx", "entity.name.type.module.tsx"],
        "settings": {
          "foreground": "#111111"
        }
      },
      {
        "name": "TypeScript Class Variable Keyword",
        "scope": [
          "meta.class.ts meta.var.expr.ts storage.type.ts",
          "meta.class.tsx meta.var.expr.tsx storage.type.tsx"
        ],
        "settings": {
          "foreground": "#994CC3"
        }
      },
      {
        "name": "TypeScript Method Declaration e.g. `constructor`",
        "scope": [
          "meta.method.declaration storage.type.ts",
          "meta.method.declaration storage.type.tsx"
        ],
        "settings": {
          "foreground": "#4876d6"
        }
      },
      {
        "name": "normalize font style of certain components",
        "scope": [
          "meta.property-list.css meta.property-value.css variable.other.less",
          "meta.property-list.scss variable.scss",
          "meta.property-list.sass variable.sass",
          "meta.brace",
          "keyword.operator.operator",
          "keyword.operator.or.regexp",
          "keyword.operator.expression.in",
          "keyword.operator.relational",
          "keyword.operator.assignment",
          "keyword.operator.comparison",
          "keyword.operator.type",
          "keyword.operator",
          "keyword",
          "punctuation.definintion.string",
          "punctuation",
          "variable.other.readwrite.js",
          "storage.type",
          "source.css",
          "string.quoted"
        ],
        "settings": {
          "fontStyle": ""
        }
      }
    ]
  }