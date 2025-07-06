module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testMatch: [
    "**/test/**/*.test.ts",
    "**/__tests__/**/*.ts",
    "**/*.(test|spec).ts",
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: "test/tsconfig.json"
    }],
  },
  collectCoverageFrom: [
    "src/**/*.ts", 
    "!src/**/*.d.ts",
    "!src/**/*.test.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^vscode$": "<rootDir>/test/__mocks__/vscode.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testTimeout: 30000,
  verbose: true,
};
