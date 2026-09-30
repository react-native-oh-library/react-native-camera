> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-camera</code> </h1>
</p>

本项目基于 [react-native-camera](https://github.com/react-native-camera/react-native-camera) 开发。

版本所属关系如下：

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| @react-native-ohos/react-native-camera | [~3.41.1](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.77.* | 否 | API12+ | v3.40.0 | [br_rnoh0.77](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.77) |

## 简介

react-native-camera 是 React Native 的相机组件，同时支持条码扫描。<br/>
支持前后摄像头切换、闪光灯与白平衡控制、自动对焦与缩放、拍照（takePictureAsync）、录像（recordAsync）、条码扫描（onBarCodeRead）等能力。

## 下载安装

进入到工程目录并输入以下命令：

**npm**

```bash
npm install @react-native-ohos/react-native-camera
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-camera
```

## Link

| 版本 | 是否支持autolink | RN框架版本 |
|------|----------------|-----------|
| ~3.41.1 | 否 | 0.77.* |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/CPF-RN/ohos_react_native/blob/main/docs/zh-cn/02-开发/02-开发指南/Autolinking.md

ManualLink: 此步骤为手动配置原生依赖项的指导

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.77.33" // ohpm 在线版本
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // 指向本地 har 包的路径
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony" // 指向源码路径
  }
}
```

### 2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入；
- 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@react-native-ohos/react-native-camera": "file:../../node_modules/@react-native-ohos/react-native-camera/harmony/reactNativeCamera.har"
  }
```

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md)

### 3. 配置 CMakeLists 和引入 NativeCameraPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-camera/src/main/cpp" ./reactNativeCamera)
# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_native_camera)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
#include "SamplePackage.h"
+ #include "NativeCameraPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<NativeCameraPackage>(ctx)
    };
}
```

### 4. 在 ArkTS 侧引入 ReactCameraView 组件

找到 **function buildCustomComponent()**，一般位于 `entry/src/main/ets/pages/index.ets` 或 `entry/src/main/ets/rn/LoadBundle.ets`，添加：

```diff
  ...
+ import { ReactCameraView } from "@react-native-ohos/react-native-camera"

@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  ...
+ if (ctx.componentName === ReactCameraView.NAME) {
+   ReactCameraView({
+     ctx: ctx.rnComponentContext,
+     tag: ctx.tag
+   })
+ }
 ...
}
```

### 5. 在 ArkTS 侧引入 ReactNativeCameraPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
  ...
+ import { ReactNativeCameraPackage } from "@react-native-ohos/react-native-camera"

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new ReactNativeCameraPackage(ctx)
  ];
}
```

### 运行

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 约束与限制

### 兼容性

本文档内容基于以下版本验证通过：

1. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;

### 编译运行API要求

> [!TIP] 当前三方库所有版本均已实现版本隔离，支持在 `API12+` 工程编译，及 `API12+` ROM运行。

> [!TIP] 以下功能依赖特定版本的API，使用 `低于指定API版本的工程编译` 或 `低于指定API版本的ROM运行` 均可能导致部分功能受限。
1. `whiteBalance` 属性需要在支持 `API20+` 的 ROM 上运行，方可生效。

### 权限要求

#### 在 entry 目录下的 module.json5 中添加权限

打开 `entry/src/main/module.json5`，添加：

```diff
...
"requestPermissions": [
+  {
+    "name": "ohos.permission.CAMERA",
+    "reason": "$string:camera_reason",
+    "usedScene": {
+      "abilities": [
+        "EntryAbility"
+      ],
+      "when":"inuse"
+    }
+  },
+  {
+    "name": "ohos.permission.MICROPHONE",
+    "reason": "$string:microphone_reason",
+    "usedScene": {
+      "abilities": [
+        "EntryAbility"
+      ],
+      "when":"inuse"
+    }
+  },
+  {
+    "name": "ohos.permission.APPROXIMATELY_LOCATION",
+    "reason": "$string:location_reason",
+    "usedScene": {
+      "abilities": [
+        "EntryAbility"
+      ],
+      "when":"inuse"
+    }
+  },
]
```

#### 在 entry 目录下添加申请以上权限的原因

打开 `entry/src/main/resources/base/element/string.json`，添加：

```diff
...
{
  "string": [
+    {
+      "name": "camera_reason",
+      "value": "使用相机"
+    },
+    {
+      "name": "microphone_reason",
+      "value": "使用麦克风"
+    },
+    {
+      "name": "location_reason",
+      "value": "录像时获取位置信息"
+    },
  ]
}
```

> [!TIP] `ohos.permission.MICROPHONE` 仅在 `captureAudio` 为 `true`（默认值）时必需；`ohos.permission.APPROXIMATELY_LOCATION` 供录像时写入位置信息使用。

## 使用示例

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```jsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

class CameraExample extends React.Component {
  takePicture = async () => {
    if (this.camera) {
      try {
        const data = await this.camera.takePictureAsync({ quality: 0.5 });
        console.log('takePicture result: ' + (data.path ? data.path : data.uri));
      } catch (error) {
        console.warn('takePicture failed:', error);
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => { this.camera = ref; }}
          style={styles.preview}
          type="back"
          flashMode="off"
          captureAudio={false}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.capture} onPress={this.takePicture}>
            <Text style={styles.buttonText}>拍照</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: 'black' },
  preview: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  buttonContainer: { flex: 0, flexDirection: 'row', justifyContent: 'center' },
  capture: { flex: 0, backgroundColor: '#1E90FF', borderRadius: 5, padding: 15, margin: 20 },
  buttonText: { fontSize: 14, color: '#fff' },
});

export default CameraExample;
```

## 使用说明

**基本使用**

```jsx
<RNCamera
  ref={cameraRef}
  style={{ flex: 1 }}
  type="back"
  flashMode="off"
  autoFocus="on"
  captureAudio={false}
/>
```

**拍照（takePictureAsync）**

```jsx
const options = { quality: 0.5, base64: true };
const data = await this.camera.takePictureAsync(options).catch((error) => {
  console.warn('takePicture failed:', error);
});
if (data) {
  console.log('takePicture result: ' + (data.path ? data.path : data.uri));
}
```

**录像（recordAsync）**

```jsx
const result = await this.camera.recordAsync({ maxDuration: 30 }).catch((error) => {
  console.warn('record failed:', error);
});
if (result) {
  console.log('video saved to: ' + result.uri);
}
```

**条码扫描（onBarCodeRead）**

```jsx
<RNCamera
  ref={cameraRef}
  style={{ flex: 1 }}
  onBarCodeRead={(event) => {
    console.log('barCode type: ' + event.nativeEvent.type + ', data: ' + event.nativeEvent.data);
  }}
/>
```

## 接口说明

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "OpenHarmony Support"列为 yes 表示 OpenHarmony平台支持 该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

### 组件

| 名称 | 参数类型 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
|------|--------|------|------|------------------|------|
| RNCamera | [RNCameraProps](#属性) | no | All | Yes | 相机组件，支持预览、拍照、录像与条码扫描 |

### 属性
RNCameraProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- | --- |
| type | string | back | no | Android、iOS | Yes | 摄像头类型：back（后置）/front（前置）。 |
| flashMode | string | off | no | Android、iOS | Yes | 闪光灯模式：on/off/torch/auto。 |
| autoFocus | string | on | no | Android、iOS | Yes | 自动对焦：on/off。 |
| focusDepth | number | 0 | no | Android、iOS | Yes | 非自动对焦时的对焦值（0~1）。 |
| exposure | number | None | no | Android、iOS | Yes | 曝光补偿。 |
| zoom | number | None | no | Android、iOS | Yes | 缩放比例。 |
| maxZoom | number | None | no | Android、iOS | Yes | 最大缩放比例。 |
| useNativeZoom | boolean | false | no | Android、iOS | Yes | 启用原生捏合缩放手势。 |
| captureAudio | boolean | true | no | Android、iOS | Yes | 是否开启录音（用于录像）。 |
| pictureSize | string | 'None' | no | Android、iOS | Yes | 图片分辨率，格式如 "1920x1080"。 |
| defaultVideoQuality | string | None | no | Android、iOS | Yes | 默认视频分辨率，如 "1080p"。 |
| videoStabilizationMode | string | 0 | no | Android、iOS | Yes | 视频防抖模式：off/standard/cinematic/auto。 |
| whiteBalance | string | auto | no | Android、iOS | Yes | 白平衡：sunny/cloudy/shadow/incandescent/fluorescent/auto，需在支持 API20+ 的 ROM 上运行方可生效。 |
| onBarCodeRead | function | None | no | Android、iOS | Yes | 条码扫描回调；event.nativeEvent 含 data（条码内容）、type（码型）、bounds（位置）等。 |
| onCameraReady | function | None | no | Android、iOS | Yes | 相机就绪回调。 |
| onPictureTaken | function | None | no | Android、iOS | Yes | 拍照完成回调。 |
| onRecordingStart | function | None | no | Android、iOS | Yes | 录像开始回调；event.nativeEvent 含 uri、videoOrientation、deviceOrientation。 |
| onRecordingEnd | function | None | no | Android、iOS | Yes | 录像结束回调。 |
| onMountError | function | None | no | Android、iOS | Yes | 相机异常回调；error.message 为错误信息。 |
| onStatusChange | function | None | no | Android、iOS | Yes | 相机状态变化回调；event 含 cameraStatus、recordAudioPermissionStatus。 |
| onAudioConnected | function | None | no | Android、iOS | Yes | 音频会话连接回调。 |
| cameraId | string | None | no | iOS | No | 精确指定摄像头设备（harmony 暂不支持）。 |
| autoFocusPointOfInterest | object | None | no | Android、iOS | No | 设置自动对焦点（x/y）。 |
| ratio | string | '4:3' | no | Android、iOS | No | 相机比例。 |
| playSoundOnCapture | boolean | false | no | Android | No | 拍照快门音。 |
| keepAudioSession | boolean | false | no | iOS | No | 卸载时不释放音频会话。 |
| useCamera2Api | boolean | false | no | Android | No | 使用 Android Camera2 API。 |
| mirrorVideo | boolean | false | no | Android、iOS | No | 镜像录像。 |
| barCodeTypes | array | None | no | Android、iOS | No | 条码识别类型数组。 |
| detectedImageInEvent | boolean | false | no | Android、iOS | No | 扫码回调携带原始图像。 |
| rectOfInterest | object | None | no | Android、iOS | No | 限定条码识别区域。 |
| googleVisionBarcodeType | number | None | no | Android | No | 条码类型（Google Vision）。 |
| googleVisionBarcodeMode | number | None | no | Android | No | 条码识别模式（Google Vision）。 |
| faceDetectionMode | number | None | no | Android、iOS | No | 人脸检测模式。 |
| faceDetectionLandmarks | number | None | no | Android、iOS | No | 人脸特征点检测。 |
| faceDetectionClassifications | number | None | no | Android、iOS | No | 人脸分类检测。 |
| trackingEnabled | boolean | false | no | Android、iOS | No | 人脸跟踪。 |
| notAuthorizedView | element | None | no | Android | No | 未授权时显示的 UI。 |
| pendingAuthorizationView | element | None | no | Android | No | 正在授权时显示的 UI。 |
| permissionDialogTitle | string | '' | no | Android | No | 权限弹窗标题（已废弃）。 |
| permissionDialogMessage | string | '' | no | Android | No | 权限弹窗文案（已废弃）。 |
| androidCameraPermissionOptions | object | null | no | Android | No | 相机权限弹窗配置。 |
| androidRecordAudioPermissionOptions | object | null | no | Android | No | 录音权限弹窗配置。 |
| onGoogleVisionBarcodesDetected | function | None | no | Android | No | Google 条码识别回调。 |
| onFaceDetected | function | None | no | Android、iOS | No | 人脸识别数据回调（harmony 暂不支持）。 |
| onFaceDetectionError | function | None | no | Android、iOS | No | 人脸检测错误回调。 |
| onTextRecognized | function | None | no | Android、iOS | No | 文字识别回调。 |
| onTap | function | None | no | iOS | No | 单击预览回调。 |
| onDoubleTap | function | None | no | Android、iOS | No | 双击预览回调。 |
| onAudioInterrupted | function | None | no | iOS | No | 音频会话中断回调。 |
| onPictureSaved | function | None | no | Android、iOS | No | 照片保存回调。 |
| onSubjectAreaChanged | function | None | no | iOS | No | 主体区域变化回调。 |

### API

| 名称 | 类型 | 参数类型 | 返回值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| ---- | ---- | -------- | ------ | ---- | ---- | ------------------- | ---- |
| takePictureAsync | function | options?: object | Promise<TakePictureResponse> | no | Android、iOS | Yes | 照相；options 可选 quality（0~1）、base64 等；resolve 出照片信息（path/uri、width、height 等）。 |
| recordAsync | function | options?: object | Promise<RecordResponse> | no | Android、iOS | Yes | 开始录像；options 可选 maxDuration、maxFileSize、mute、quality（建议传数值）等；resolve 出 RecordResponse（uri、videoOrientation、deviceOrientation、isRecordingInterrupted）。 |
| stopRecording | function | / | void | no | Android、iOS | Yes | 停止录像。 |
| pauseRecording | function | / | void | no | Android、iOS | Yes | 暂停录像，仅录像中有效。 |
| resumeRecording | function | / | void | no | Android、iOS | Yes | 恢复录像，仅暂停后有效。 |
| pausePreview | function | / | void | no | Android、iOS | Yes | 暂停预览（画面冻结）。 |
| resumePreview | function | / | void | no | Android、iOS | Yes | 恢复预览。 |
| isRecording | function | / | Promise<boolean> | no | Android、iOS | Yes | 查询是否正在录像。 |
| getCameraIdsAsync | function | / | Promise<CameraDeviceInfo[]> | no | Android、iOS | Yes | 获取可用摄像头列表。 |
| getAvailablePictureSizes | function | / | Promise<string[]> | no | Android、iOS | Yes | 获取可用图片分辨率，如 "1920x1080"。 |
| refreshAuthorizationStatus | function | / | Promise<void> | no | Android、iOS | Yes | 重新检查相机/麦克风权限并更新组件授权状态。 |
| getSupportedRatiosAsync | function | / | Promise<string[]> | no | Android、iOS | No | 获取支持的预览宽高比。 |
| getSupportedPreviewFpsRange | function | / | Promise<string[]> | no | Android、iOS | No | 获取支持的帧率范围。 |

### Constants

枚举常量经 `RNCamera.Constants` 访问（如 `RNCamera.Constants.FlashMode.off`）。该分支 JS 层 `Constants` 为桩实现，部分枚举成员缺失，属性枚举建议直接使用字符串字面量赋值（如 `flashMode="torch"`），鸿蒙侧按字符串解析，行为一致。

| 枚举 | 对应接口 | 成员值 | OpenHarmony平台支持 |
| ---- | -------- | ------ | ------------------- |
| CameraStatus | onStatusChange 事件 | READY / PENDING_AUTHORIZATION / NOT_AUTHORIZED | Yes |
| RecordAudioPermissionStatus | onStatusChange 事件 | AUTHORIZED / PENDING_AUTHORIZATION / NOT_AUTHORIZED | Yes |
| Type | type 属性 | front / back | Yes |
| AutoFocus | autoFocus 属性 | on / off | Yes |
| FlashMode | flashMode 属性 | on / off / torch / auto | Yes |
| WhiteBalance | whiteBalance 属性 | sunny / cloudy / shadow / incandescent / fluorescent / auto | partially（需 API20+） |
| VideoQuality | defaultVideoQuality 属性、recordAsync 的 quality | 2160p / 1080p / 720p / 480p / 4:3 | partially（该分支 Constants.VideoQuality 为空实现，recordAsync 的 quality 建议传数值） |
| VideoStabilization | videoStabilizationMode 属性 | off / standard / cinematic / auto | partially（属性支持，Constants 成员为空实现） |
| Orientation | takePictureAsync / recordAsync 的 orientation | auto / landscapeLeft / landscapeRight / portrait / portraitUpsideDown | No |
| BarCodeType | barCodeTypes 属性 | aztec / code128 / code39 / code39mod43 / code93 / ean13 / ean8 / pdf417 / qr / upc_e / interleaved2of5 / itf14 / datamatrix | No |
| VideoCodec | recordAsync 的 codec（iOS） | H264 / JPEG / HVEC / AppleProRes422 / AppleProRes4444 | No |
| FaceDetection | faceDetectionMode 等属性 | Mode: fast / accurate；Landmarks: all / none；Classifications: all / none | No |
| GoogleVisionBarcodeDetection | googleVisionBarcodeType 等属性（Android） | BarcodeType: CODE_128 / CODE_39 / CODABAR / DATA_MATRIX / EAN_13 / EAN_8 / ITF / QR_CODE / UPC_A / UPC_E / PDF417 / AZTEC / ALL；BarcodeMode: NORMAL / ALTERNATE / INVERTED | No |

## 遗留问题

- onFacesDetected 人脸检测暂不支持: [issue#8](https://github.com/react-native-oh-library/react-native-camera/issues/8)
- autoFocusPointOfInterest 属性暂不支持。

## 其他

- whiteBalance 仅在支持 API20+ 的 ROM 上生效。
- recordAsync 的 quality 参数建议传数值（该分支 Constants.VideoQuality 为空实现，传字符串会抛错）。

## 目录结构
````
/react-native-camera                    # 项目根目录
├── harmony                             # 鸿蒙适配代码
│   ├── reactNativeCamera.har           # har包
│   └── reactNativeCamera               # 鸿蒙适配核心代码
│       ├── index.ets                   # 鸿蒙适配代码入口
│       ├── ts.ts                    # TypeScript 导出入口
│       └── src/main
│           ├── ets
│           │   ├── ReactCameraView.ets             # RNCamera 鸿蒙组件实现
│           │   ├── ReactNativeCameraPackage.ts     # 模块注册 Package
│           │   ├── ReactNativeCameraTurboModule.ts # RNCCameraModule TurboModule 实现
│           │   ├── FaceDectorPackage.ts            # 人脸检测 Package
│           │   ├── FaceDectorTurboModule.ts        # RNCFaceDector TurboModule 实现
│           │   └── service                         # 相机会话/扫码等核心服务
│           └── cpp                                 # C++ 层（NativeCameraPackage/RNCCameraModule 等）
├── src                                 # RN代码
│   ├── index.js                        # 入口文件
│   ├── RNCamera.js                     # RNCamera 组件封装
│   ├── FaceDetector.js                 # 人脸检测封装
│   ├── NativeCamera.ts                 # 组件 Codegen 声明
│   ├── NativeCameraModule.ts           # RNCCameraModule TurboModule 声明
│   └── NativeFaceDetector.ts           # 人脸检测 TurboModule 声明
├── types                               # TS 类型定义（index.d.ts）
├── CHANGELOG.md                        # 版本变更记录
├── LICENSE                             # 开源协议文件
├── README.md                           # 中文安装使用方法
└── README_en.md                        # 英文安装使用方法
````

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://github.com/react-native-oh-library/react-native-camera/issues)，当然，也非常欢迎提交 [PR](https://github.com/react-native-oh-library/react-native-camera/pulls) 。

## 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/react-native-camera/react-native-camera/blob/master/LICENSE) ，请自由地享受和参与开源。
