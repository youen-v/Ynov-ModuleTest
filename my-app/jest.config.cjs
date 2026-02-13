module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  moduleFileExtensions: ["vue", "js", "json"],

  moduleNameMapper: {
    "^@vue/test-utils$":
      "<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js",
  },
};
