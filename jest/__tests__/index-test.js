/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * index.js 白盒测试（exports 形状与再导出透传）。
 */

jest.mock("react", () => require("../helpers/reactMock"));
jest.mock("prop-types", () => require("../helpers/propTypesMock"));
jest.mock("react-native", () => require("../helpers/reactNativeMock"));
jest.mock("../../src/NativeCamera", () => require("../helpers/nativeCameraMock"));
jest.mock("../../src/NativeCameraModule", () => require("../helpers/nativeCameraModuleMock"));
jest.mock("../../src/NativeFaceDetector", () => require("../helpers/nativeFaceDetectorMock"));
jest.mock("../../src/FaceDetector", () => {
  const Native = require("../helpers/nativeFaceDetectorMock");
  class FaceDetector {}
  FaceDetector.Constants = {
    Mode: Native.Mode,
    Landmarks: Native.Landmarks,
    Classifications: Native.Classifications,
  };
  FaceDetector.detectFacesAsync = jest.fn();
  return { __esModule: true, default: FaceDetector, Constants: FaceDetector.Constants };
});

const index = require("../../src/index");
const nativeModuleMock = require("../helpers/nativeCameraModuleMock");

describe("index exports 形状", () => {
  it("导出 RNCamera（类）", () => {
    expect(typeof index.RNCamera).toBe("function");
    expect(index.RNCamera.displayName).toBeUndefined();
    expect(index.RNCamera.prototype).toBeDefined();
  });

  it("导出 FaceDetector（类）", () => {
    expect(typeof index.FaceDetector).toBe("function");
  });

  it("导出 hasTorch（函数）", () => {
    expect(typeof index.hasTorch).toBe("function");
  });

  it("RNCamera.Constants 形状（Type/AutoFocus/FlashMode 字符串化）", () => {
    expect(index.RNCamera.Constants.Type.back).toBe("back");
    expect(index.RNCamera.Constants.FlashMode.off).toBe("off");
  });

  it("hasTorch 调用透传到 harmony 分支的 NativeCameraModule", async () => {
    nativeModuleMock.hasTorch.mockResolvedValueOnce(false);
    await expect(index.hasTorch()).resolves.toBe(false);
    expect(nativeModuleMock.hasTorch).toHaveBeenCalledTimes(1);
  });
});
