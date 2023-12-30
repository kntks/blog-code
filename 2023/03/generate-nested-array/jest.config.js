module.exports = {
  coveragePathIgnorePatterns: [
    "node_modules",
  ],
  testMatch: [
    "**/__tests__/**/*.test.(ts|js)"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  }
}
