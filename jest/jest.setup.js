/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * Jest 全局 setup（rnoh-js-test skill 的 setupFiles 配置位）。
 *
 * camera 的 JS 层依赖面在测试侧由各测试文件显式 jest.mock 隔离：
 * 1. react-native（Platform/DeviceEventEmitter/findNodeHandle/组件等）—— helpers/reactNativeMock.js
 * 2. prop-types —— helpers/propTypesMock.js
 * 3. react —— helpers/reactMock.js
 * 4. src/NativeCameraModule（TurboModule spec）—— helpers/nativeCameraModuleMock.js
 * 5. src/NativeCamera（codegen 组件 spec + Commands）—— helpers/nativeCameraMock.js
 * 6. src/NativeFaceDetector —— helpers/nativeFaceDetectorMock.js
 *
 * 库源码检查 __DEV__（由 jest.config.js 的 globals 提供），其余 RN 全局未引用。
 */
