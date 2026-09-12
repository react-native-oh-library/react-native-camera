/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * 库根薄壳 jest 配置：转发到 jest/jest.config.js（真正的配置与注释在那里）。
 * Jest CLI 从库根运行时只自动发现库根的 jest.config.js。
 */

module.exports = require("./jest/jest.config.js");
