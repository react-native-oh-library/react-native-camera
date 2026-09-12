/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/**
 * prop-types 的 jest mock（各测试文件顶部
 * `jest.mock("prop-types", () => require("../helpers/propTypesMock"))` 显式激活）。
 *
 * RNCamera.js 用 PropTypes 声明 static propTypes（仅 dev 校验用），运行时只需要
 * 校验器对象存在。stub 成员取值返回可链式占位对象（.isRequired 继续可链）。
 */

function checker() {
  const fn = function () {};
  fn.isRequired = fn;
  return fn;
}

const PropTypes = {
  array: checker(),
  bool: checker(),
  func: checker(),
  number: checker(),
  object: checker(),
  string: checker(),
  symbol: checker(),
  any: checker(),
  element: checker(),
  elementType: checker(),
  instanceOf: checker,
  enum: checker,
  node: checker(),
  objectOf: checker,
  oneOf: checker,
  oneOfType: checker,
  arrayOf: checker,
  exact: checker,
  shape: checker,
};

module.exports = PropTypes;
