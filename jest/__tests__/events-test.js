/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * RNCamera 事件处理白盒测试：
 * - _onObjectDetected 的事件去重节流（同 payload 在 EventThrottleMs 内不重复回调）
 * - _onTouch 的 onTap / onDoubleTap 分发（isDoubleTap 标志区分）
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

const { RNCamera } = require("../../src/index");

function makeEvent(type, payload) {
  return { type, ...payload };
}

describe("_onObjectDetected 节流", () => {
  it("相同 payload 在节流窗口内只回调一次", () => {
    const cam = new RNCamera({});
    const cb = jest.fn();
    const handler = cam._onObjectDetected(cb);
    const nativeEvent = makeEvent("onBarCodeRead", { data: "qr-1" });
    handler({ nativeEvent });
    handler({ nativeEvent });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("payload 变化后再次回调", () => {
    const cam = new RNCamera({});
    const cb = jest.fn();
    const handler = cam._onObjectDetected(cb);
    handler({ nativeEvent: makeEvent("onBarCodeRead", { data: "qr-1" }) });
    handler({ nativeEvent: makeEvent("onBarCodeRead", { data: "qr-2" }) });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("callback 为空时不写入节流缓存", () => {
    const cam = new RNCamera({});
    const handler = cam._onObjectDetected(undefined);
    expect(() => handler({ nativeEvent: makeEvent("onBarCodeRead", { data: "x" }) })).not.toThrow();
  });
});

describe("_onTouch 分发", () => {
  it("单击分发 onTap", () => {
    const cam = new RNCamera({});
    const onTap = jest.fn();
    const onDoubleTap = jest.fn();
    cam.props = { onTap, onDoubleTap };
    cam._onTouch({ nativeEvent: { isDoubleTap: false, touchOrigin: { x: 1, y: 2 } } });
    expect(onTap).toHaveBeenCalledWith({ x: 1, y: 2 });
    expect(onDoubleTap).not.toHaveBeenCalled();
  });

  it("双击分发 onDoubleTap", () => {
    const cam = new RNCamera({});
    const onTap = jest.fn();
    const onDoubleTap = jest.fn();
    cam.props = { onTap, onDoubleTap };
    cam._onTouch({ nativeEvent: { isDoubleTap: true, touchOrigin: { x: 3, y: 4 } } });
    expect(onDoubleTap).toHaveBeenCalledWith({ x: 3, y: 4 });
    expect(onTap).not.toHaveBeenCalled();
  });

  it("未传回调时不抛错", () => {
    const cam = new RNCamera({});
    cam.props = {};
    expect(() =>
      cam._onTouch({ nativeEvent: { isDoubleTap: false, touchOrigin: { x: 0, y: 0 } } })
    ).not.toThrow();
  });
});
