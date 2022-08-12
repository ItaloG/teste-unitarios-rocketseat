export default {
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  preset: "ts-jest",
  coverageDirectory: "coverage",
  coverageProvider: "v8",  
  testMatch: ["**/*.spec.ts"],
};
