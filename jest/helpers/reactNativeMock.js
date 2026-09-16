/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * react-native 的 jest mock（各测试文件顶部
 * `jest.mock("react-native", () => require("../helpers/reactNativeMock"))` 显式激活）。
 *
 * 覆盖 RNCamera.js / FaceDetector.js / index.js 的 react-native 依赖面：
 * Platform / DeviceEventEmitter / findNodeHandle / PermissionsAndroid /
 * ViewPropTypes / View / ActivityIndicator / Text / StyleSheet。
 * 每个 Jest 测试文件是独立 module registry，本文件在每个测试文件中各执行一次。
 */

// 平台态可切换：测试 iOS 分支时用 RNCameraJestMock.setPlatformOS("ios")
let currentOS = "harmony";

const Platform = {
  get OS() {
    return currentOS;
  },
  select: (specifics) => specifics[currentOS] || specifics.ios,
};

// 事件名 → 最近注册的 handler（供测试侧 emit 触发）
const handlers = new Map();
// 事件名 → 最近返回的订阅句柄（供测试侧断言 remove）
const subsByEvent = new Map();

const DeviceEventEmitter = {
  addListener: jest.fn((eventName, handler) => {
    handlers.set(eventName, handler);
    const sub = { remove: jest.fn() };
    subsByEvent.set(eventName, sub);
    return sub;
  }),
};

const PermissionsAndroid = {
  REQUEST_INSTALL_PACKAGES: undefined,
  RESULTS: { GRANTED: "granted", DENIED: "denied", NEVER_ASK_AGAIN: "never_ask_again" },
  request: jest.fn(async () => PermissionsAndroid.RESULTS.GRANTED),
  requestMultiple: jest.fn(async () => ({ "android.permission.CAMERA": "granted" })),
  check: jest.fn(async () => true),
};

function StyleStub() {}

module.exports = {
  Platform,
  DeviceEventEmitter,
  findNodeHandle: jest.fn(() => 1),
  PermissionsAndroid,
  ViewPropTypes: new Proxy({}, { get: () => ({}), has: () => true }),
  View: StyleStub,
  ActivityIndicator: StyleStub,
  Text: StyleStub,
  StyleSheet: { create: (styles) => styles },
  // 测试钩子命名空间
  RNCameraJestMock: {
    setPlatformOS: (os) => {
      currentOS = os;
    },
    emit: (eventName, payload) => {
      const handler = handlers.get(eventName);
      if (!handler) return false;
      handler(payload);
      return true;
    },
    getSubscription: (eventName) => subsByEvent.get(eventName),
  },
};
