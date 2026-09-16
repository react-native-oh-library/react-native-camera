/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * react 的 jest mock（各测试文件顶部
 * `jest.mock("react", () => require("../helpers/reactMock"))` 显式激活）。
 *
 * RNCamera.js 是 class 组件 + JSX。Component stub 提供可用的
 * constructor/setState/forceUpdate，让测试能直接实例化 Camera 类。
 * JSX 由 babel 的 @babel/plugin-transform-react-jsx 转为 createElement，
 * mock 的 createElement 返回描述对象即可（测试不渲染）。
 */

class Component {
  constructor(props) {
    this.props = props || {};
    this.state = {};
  }
  setState(partial, callback) {
    const next = typeof partial === "function" ? partial(this.state, this.props) : partial;
    this.state = { ...this.state, ...next };
    if (callback) callback();
  }
  forceUpdate() {}
}

const React = {
  Component,
  PureComponent: Component,
  memo: (x) => x,
  createElement: jest.fn((type, props, ...children) => ({ type, props, children })),
  cloneElement: jest.fn((el, props) => ({ ...el, props: { ...el.props, ...props } })),
  useRef: jest.fn((init) => ({ current: init })),
  useState: jest.fn((init) => [init, jest.fn()]),
  useEffect: jest.fn(),
  useCallback: jest.fn((fn) => fn),
  Fragment: "Fragment",
};

module.exports = React;
module.exports.default = React;
