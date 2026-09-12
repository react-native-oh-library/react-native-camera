/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * src/NativeFaceDetector（TurboModule spec）的 jest mock。
 */

const NativeFaceDetector = {
  detectFaces: jest.fn(async () => []),
};

module.exports = NativeFaceDetector;
