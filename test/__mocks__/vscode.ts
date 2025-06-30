// Mock implementation of vscode module for testing

export class Range {
  public start: Position;
  public end: Position;

  constructor(
    startLine: number,
    startCharacter: number,
    endLine: number,
    endCharacter: number
  ) {
    this.start = new Position(startLine, startCharacter);
    this.end = new Position(endLine, endCharacter);
  }
}

export class Position {
  public line: number;
  public character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }
}

export class Uri {
  public scheme: string;
  public authority: string;
  public path: string;
  public query: string;
  public fragment: string;

  constructor(
    scheme: string,
    authority: string,
    path: string,
    query: string,
    fragment: string
  ) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }

  static file(path: string): Uri {
    return new Uri("file", "", path, "", "");
  }

  toString(): string {
    return `${this.scheme}://${this.authority}${this.path}`;
  }
}

export enum EndOfLine {
  LF = 1,
  CRLF = 2,
}

export class SemanticTokens {
  public data: Uint32Array;
  public resultId?: string;

  constructor(data: Uint32Array, resultId?: string) {
    this.data = data;
    this.resultId = resultId;
  }
}

export class SemanticTokensLegend {
  public tokenTypes: string[];
  public tokenModifiers: string[];

  constructor(tokenTypes: string[], tokenModifiers: string[] = []) {
    this.tokenTypes = tokenTypes;
    this.tokenModifiers = tokenModifiers;
  }
}

export class SemanticTokensBuilder {
  private legend: SemanticTokensLegend;
  private tokens: number[] = [];

  constructor(legend: SemanticTokensLegend) {
    this.legend = legend;
  }

  push(
    line: number,
    char: number,
    length: number,
    tokenType: number,
    tokenModifiers: number
  ): void {
    this.tokens.push(line, char, length, tokenType, tokenModifiers);
  }

  build(): SemanticTokens {
    return new SemanticTokens(new Uint32Array(this.tokens));
  }
}

export interface CancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: any;
}

export interface TextLine {
  lineNumber: number;
  text: string;
  range: Range;
  rangeIncludingLineBreak: Range;
  firstNonWhitespaceCharacterIndex: number;
  isEmptyOrWhitespace: boolean;
}

export interface TextDocument {
  uri: Uri;
  fileName: string;
  isUntitled: boolean;
  languageId: string;
  version: number;
  isDirty: boolean;
  isClosed: boolean;
  eol: EndOfLine;
  lineCount: number;
  encoding: string;

  getText(): string;
  save(): Thenable<boolean>;
  lineAt(line: number | Position): TextLine;
  offsetAt(position: Position): number;
  positionAt(offset: number): Position;
  getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined;
  validateRange(range: Range): Range;
  validatePosition(position: Position): Position;
}

export interface DocumentSemanticTokensProvider {
  getLegend?(): SemanticTokensLegend;
  provideDocumentSemanticTokens(
    document: TextDocument,
    token: CancellationToken
  ): Promise<SemanticTokens>;
  provideDocumentSemanticTokensEdits?(
    document: TextDocument,
    previousResultId: string,
    token: CancellationToken
  ): Promise<SemanticTokens | SemanticTokensEdits>;
}

export interface DocumentRangeSemanticTokensProvider {
  getLegend?(): SemanticTokensLegend;
  provideDocumentRangeSemanticTokens(
    document: TextDocument,
    range: Range,
    token: CancellationToken
  ): Promise<SemanticTokens>;
}

export interface SemanticTokensEdits {
  readonly resultId?: string;
  readonly edits: SemanticTokensEdit[];
}

export interface SemanticTokensEdit {
  readonly start: number;
  readonly deleteCount: number;
  readonly data?: Uint32Array;
}

// Mock workspace configuration
export const workspace = {
  getConfiguration: (section?: string) => ({
    get: (key: string, defaultValue?: any) => defaultValue,
    update: () => Promise.resolve(),
    has: () => true,
    inspect: () => undefined,
  }),
  textDocuments: [],
  onDidChangeConfiguration: () => ({ dispose: () => {} }),
};

// Mock window
export const window = {
  showInformationMessage: (message: string) => Promise.resolve(),
  showErrorMessage: (message: string) => Promise.resolve(),
  createStatusBarItem: () => ({
    text: "",
    tooltip: "",
    command: "",
    show: () => {},
    hide: () => {},
    dispose: () => {},
  }),
};

// Mock languages
export const languages = {
  registerDocumentSemanticTokensProvider: () => ({ dispose: () => {} }),
  registerDocumentRangeSemanticTokensProvider: () => ({ dispose: () => {} }),
  setTextDocumentLanguage: () => Promise.resolve(),
};

// Mock commands
export const commands = {
  registerCommand: () => ({ dispose: () => {} }),
};

// Mock enums and constants
export enum StatusBarAlignment {
  Left = 1,
  Right = 2,
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}
