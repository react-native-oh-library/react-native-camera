/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * RNCamera.js 的 Constants 与 defaultProps 形状白盒测试。
 * 重点锁定 harmony 适配的枚举常量字符串化（JS stub 常量须与 cpp 枚举解析一致）。
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
    Mode: {},
    Landmarks: {},
    Classifications: {},
  };
  FaceDetector.detectFacesAsync = jest.fn();
  return { __esModule: true, default: FaceDetector, Constants: FaceDetector.Constants };
});

const { RNCamera } = require("../../src/index");

describe("Constants 形状（harmony 枚举字符串化锁定）", () => {
  const { Constants } = RNCamera;

  it("Type 为字符串枚举", () => {
    expect(Constants.Type.back).toBe("back");
    expect(Constants.Type.front).toBe("front");
  });

  it("AutoFocus 为字符串枚举", () => {
    expect(Constants.AutoFocus.on).toBe("on");
    expect(Constants.AutoFocus.off).toBe("off");
  });

  it("FlashMode 为字符串枚举（4 值）", () => {
    expect(Constants.FlashMode).toEqual({ off: "off", on: "on", torch: "torch", auto: "auto" });
  });

  it("WhiteBalance 为字符串枚举（6 值）", () => {
    expect(Constants.WhiteBalance).toEqual({
      sunny: "sunny",
      cloudy: "cloudy",
      shadow: "shadow",
      incandescent: "incandescent",
      fluorescent: "fluorescent",
      auto: "auto",
    });
  });

  it("GoogleVisionBarcodeDetection 形状", () => {
    expect(Constants.GoogleVisionBarcodeDetection).toEqual({ BarcodeType: 0, BarcodeMode: 0 });
  });

  it("视频稳定枚举默认值 stub 存在", () => {
    expect(Constants.VideoStabilization).toBeDefined();
  });
});

describe("defaultProps 形状", () => {
  const { RNCamera } = require("../../src/index");
  const defaultProps = RNCamera.defaultProps;

  it("cameraId 默认空字符串（4.2.1 语义：null -> ''）", () => {
    expect(defaultProps.cameraId).toBe("");
  });

  it("type 默认 back", () => {
    expect(defaultProps.type).toBe("back");
  });

  it("playSoundOnRecord 默认 false", () => {
    expect(defaultProps.playSoundOnRecord).toBe(false);
  });

  it("captureAudio 默认 true", () => {
    expect(defaultProps.captureAudio).toBe(true);
  });

  it("枚举类默认值取自字符串常量", () => {
    expect(defaultProps.autoFocus).toBe("on");
    expect(defaultProps.flashMode).toBe("off");
    expect(defaultProps.whiteBalance).toBe("auto");
  });

  it("常规默认值", () => {
    expect(defaultProps.ratio).toBe("4:3");
    expect(defaultProps.pictureSize).toBe("None");
    expect(defaultProps.playSoundOnCapture).toBe(false);
    expect(defaultProps.videoStabilizationMode).toBe("off");
  });
});
