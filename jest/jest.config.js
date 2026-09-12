/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * RNOH JS 层白盒测试基础设施（@react-native-ohos/react-native-camera）
 *
 * 按 rnoh-js-test skill 方法论生成（仿 @react-native-ohos/react-native-sensors 落地形态）：
 * - babel-jest + @babel/preset-flow 转译方案（hermes parser 解析 Flow/ESM/JSX）
 * - testMatch 精确匹配连字符命名 `*-test.js`
 * - `__DEV__` globals、transformIgnorePatterns、coverage 白名单
 *
 * 工具链解析：库根 devDependencies 声明 jest@29.7.0 与 @babel/* 工具链，
 * 装入库根 node_modules，createRequire 锚定库根解析为绝对路径。
 *
 * 运行（在库根目录执行）：
 *   npm test                # jest --no-coverage
 *   npm run test:coverage   # jest --coverage
 */

const path = require("path");
const { createRequire } = require("module");

const toolchainRequire = createRequire(path.join(__dirname, "..", "node_modules", "_anchor_"));

const babelJest = toolchainRequire.resolve("babel-jest");
const presetEnv = toolchainRequire.resolve("@babel/preset-env");
const presetFlow = toolchainRequire.resolve("@babel/preset-flow");
const hermesParserPlugin = toolchainRequire.resolve("babel-plugin-syntax-hermes-parser");
const jsxPlugin = toolchainRequire.resolve("@babel/plugin-transform-react-jsx");

module.exports = {
  // rootDir 指向库根：coverage 以库根为基准收集 src/*.js
  rootDir: path.resolve(__dirname, ".."),

  // roots 限制在本测试目录：库根全树有 harmony 等（上万文件），
  // 不让 jest 参与 haste 扫描，避免拖慢启动
  roots: [path.resolve(__dirname)],

  // skill C2：testMatch 精确匹配连字符命名 *-test.js
  testMatch: ["<rootDir>/jest/__tests__/*-test.js"],

  // skill C3：排除 node_modules 与 oh_modules
  testPathIgnorePatterns: ["/node_modules/", "/oh_modules/", "/harmony/"],

  transform: {
    "^.+\.js$": [
      babelJest,
      {
        // 显式禁用 babel 配置文件查找：绝不加载库根上游遗留的 babel 配置
        configFile: false,
        babelrc: false,
        presets: [
          // ESM → CommonJS，node 环境直跑
          [presetEnv, { targets: { node: "current" }, modules: "commonjs" }],
          // Flow 类型剥离
          [presetFlow, { all: true }],
        ],
        plugins: [
          // hermes parser：解析 Flow/ESM/JSX 语法（仅语法，不做转换）
          [hermesParserPlugin, { parseLangTypes: "flow" }],
          // JSX 转换（RNCamera.js 的 render 含 JSX）
          [jsxPlugin],
        ],
      },
    ],
  },

  // skill 关键配置：RN 内部代码检查 __DEV__ 全局变量
  globals: {
    __DEV__: true,
  },

  transformIgnorePatterns: ["node_modules/(?!react-native|@react-native|react)"],

  // 全局 mock/兜底
  setupFiles: ["<rootDir>/jest/jest.setup.js"],

  // coverage 白名单：本库 JS 层生产文件（src/*.ts 为 codegen spec 声明，无独立运行时逻辑）
  collectCoverageFrom: ["src/*.js"],
  coverageDirectory: "<rootDir>/jest/coverage",
  coverageThreshold: {
    global: {
      // RNCamera.js 为千行 UI 组件（render/生命周期胶水占比高），白盒测试聚焦
      // 逻辑分支（平台路由/常量/事件节流/导出面），门槛按该定位设定
      branches: 20,
    },
  },
};
