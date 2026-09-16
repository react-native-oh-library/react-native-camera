/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * Babel 配置（rnoh-js-test skill 配置三件套的对齐产物）。
 *
 * jest.config.js 的 transform 已给 babel-jest 内联了同样的 presets/plugins
 * （并显式 configFile: false / babelrc: false），因此 jest 运行时不会加载本文件。
 * 本文件作用：对齐 skill 配置产物形态，供未来独立 babel 转译脚本复用。
 */

module.exports = {
  plugins: [
    ["babel-plugin-syntax-hermes-parser", { parseLangTypes: "flow" }],
  ],
  presets: [
    ["@babel/preset-env", { targets: { node: "current" }, modules: "commonjs" }],
    ["@babel/preset-flow", { all: true }],
  ],
};
