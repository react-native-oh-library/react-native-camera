/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * 平台路由白盒测试：4.2.1 新增接口的 harmony 分支透传与 iOS 分支行为。
 * 通过 RNCameraJestMock.setPlatformOS 在文件内切换平台态。
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
  FaceDetector.Constants = { Mode: {}, Landmarks: {}, Classifications: {} };
  FaceDetector.detectFacesAsync = jest.fn();
  return { __esModule: true, default: FaceDetector, Constants: FaceDetector.Constants };
});

const { RNCamera, hasTorch } = require("../../src/index");
const NativeCameraModule = require("../../src/NativeCameraModule");
const { RNCameraJestMock } = require("../helpers/reactNativeMock");

describe("harmony 平台路由（4.2.1 新增接口）", () => {
  afterEach(() => {
    jest.clearAllMocks();
    RNCameraJestMock.setPlatformOS("harmony");
  });

  it("hasTorch 透传 NativeCameraModule.hasTorch", async () => {
    NativeCameraModule.hasTorch.mockResolvedValueOnce(true);
    await expect(hasTorch()).resolves.toBe(true);
    expect(NativeCameraModule.hasTorch).toHaveBeenCalledTimes(1);
  });

  it("checkIfVideoIsValid 透传路径参数", async () => {
    NativeCameraModule.checkIfVideoIsValid.mockResolvedValueOnce(false);
    await expect(RNCamera.checkIfVideoIsValid("/tmp/v.mp4")).resolves.toBe(false);
    expect(NativeCameraModule.checkIfVideoIsValid).toHaveBeenCalledWith("/tmp/v.mp4");
  });

  it("getSupportedPreviewFpsRange 透传 handle", async () => {
    NativeCameraModule.getSupportedPreviewFpsRange.mockResolvedValueOnce(["15,30"]);
    const cam = new RNCamera({});
    cam._cameraHandle = 7;
    await expect(cam.getSupportedPreviewFpsRange()).resolves.toEqual(["15,30"]);
    expect(NativeCameraModule.getSupportedPreviewFpsRange).toHaveBeenCalledWith(7);
  });

  it("getSupportedRatiosAsync 透传 handle", async () => {
    NativeCameraModule.getSupportedRatios.mockResolvedValueOnce(["4:3"]);
    const cam = new RNCamera({});
    cam._cameraHandle = 3;
    await expect(cam.getSupportedRatiosAsync()).resolves.toEqual(["4:3"]);
    expect(NativeCameraModule.getSupportedRatios).toHaveBeenCalledWith(3);
  });

  it("getAvailablePictureSizes 透传", async () => {
    NativeCameraModule.getAvailablePictureSizes.mockResolvedValueOnce(["640x480"]);
    const cam = new RNCamera({});
    await expect(cam.getAvailablePictureSizes()).resolves.toEqual(["640x480"]);
    expect(NativeCameraModule.getAvailablePictureSizes).toHaveBeenCalledTimes(1);
  });

  it("getCameraIdsAsync 走 harmony 分支", async () => {
    NativeCameraModule.getCameraIds.mockResolvedValueOnce([{ id: "camX", type: 1 }]);
    const cam = new RNCamera({});
    const data = await cam.getCameraIdsAsync();
    expect(data).toEqual([{ id: "camX", type: 1 }]);
    expect(NativeCameraModule.getCameraIds).toHaveBeenCalledTimes(1);
  });
});

describe("iOS 平台分支", () => {
  afterEach(() => {
    jest.clearAllMocks();
    RNCameraJestMock.setPlatformOS("harmony");
  });

  it("checkIfVideoIsValid 在 iOS 短路返回 true 且不调 native", async () => {
    RNCameraJestMock.setPlatformOS("ios");
    await expect(RNCamera.checkIfVideoIsValid("/tmp/x.mp4")).resolves.toBe(true);
    expect(NativeCameraModule.checkIfVideoIsValid).not.toHaveBeenCalled();
  });

  it("getSupportedPreviewFpsRange 在 iOS 抛不支持错误", async () => {
    RNCameraJestMock.setPlatformOS("ios");
    const cam = new RNCamera({});
    await expect(cam.getSupportedPreviewFpsRange()).rejects.toThrow("not supported on iOS");
    expect(NativeCameraModule.getSupportedPreviewFpsRange).not.toHaveBeenCalled();
  });

  it("getSupportedRatiosAsync 在 iOS 抛不支持错误", async () => {
    RNCameraJestMock.setPlatformOS("ios");
    const cam = new RNCamera({});
    await expect(cam.getSupportedRatiosAsync()).rejects.toThrow("Ratio is not supported on iOS");
    expect(NativeCameraModule.getSupportedRatios).not.toHaveBeenCalled();
  });
});
