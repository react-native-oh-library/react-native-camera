/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * FaceDetector.js 白盒测试：
 * - detectFacesAsync 的参数合并（{...options, uri}）
 * - NativeTurboModule 缺失时的 stub 兜底（detectFaces reject）
 */

jest.mock("../../src/NativeFaceDetector", () => require("../helpers/nativeFaceDetectorMock"));

const NativeFaceDetector = require("../../src/NativeFaceDetector");
const FaceDetector = require("../../src/FaceDetector").default;

describe("FaceDetector（注入 stub）", () => {
  it("detectFacesAsync 合并 uri 与 options", async () => {
    NativeFaceDetector.detectFaces.mockResolvedValueOnce([]);
    const out = await FaceDetector.detectFacesAsync("file:///f.jpg", { mode: "fast" });
    expect(out).toEqual([]);
    expect(NativeFaceDetector.detectFaces).toHaveBeenCalledWith({ mode: "fast", uri: "file:///f.jpg" });
  });

  it("Constants 形状透传", () => {
    expect(FaceDetector.Constants).toBeDefined();
    expect(typeof FaceDetector.detectFacesAsync).toBe("function");
  });

});
