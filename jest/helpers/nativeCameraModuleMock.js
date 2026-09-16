/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * src/NativeCameraModule（TurboModule spec）的 jest mock。
 *
 * 全方法 jest.fn，默认返回已 resolve 的 Promise，便于透传断言；
 * 测试侧可用 RNCameraModuleMock 控制返回值。
 */

const createOk = (value) => jest.fn(async () => value);

const NativeCameraModule = {
  getCameraPermission: createOk(true),
  getAuidPermission: createOk(true),
  getCameraIds: jest.fn(async () => [{ id: "cam0", type: 0 }]),
  getAvailablePictureSizes: jest.fn(async () => ["640x480", "1280x720"]),
  hasTorch: createOk(true),
  checkIfVideoIsValid: createOk(true),
  getSupportedPreviewFpsRange: jest.fn(async () => ["15,30", "30,30"]),
  getSupportedRatios: jest.fn(async () => ["4:3", "16:9"]),
};

module.exports = NativeCameraModule;
module.exports.RNCameraModuleMock = NativeCameraModule;
