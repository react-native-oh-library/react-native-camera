/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * src/NativeCamera（codegen 组件 spec）的 jest mock。
 *
 * 源文件依赖 codegenNativeComponent / codegenNativeCommands（RN 内部模块），
 * 测试侧整体替换为 stub 组件 + Commands jest.fn。
 */

const Commands = {
  takePicture: jest.fn(),
  record: jest.fn(),
  stopRecording: jest.fn(),
  pauseRecording: jest.fn(),
  resumeRecording: jest.fn(),
  pausePreview: jest.fn(),
  resumePreview: jest.fn(),
  getSupportedRatios: jest.fn(),
  getSupportedPreviewFpsRange: jest.fn(),
};

const NativeCamera = function NativeCamera() {
  return null;
};

module.exports = NativeCamera;
module.exports.default = NativeCamera;
module.exports.Commands = Commands;
module.exports.RecordResponse = {};
