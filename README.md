> 模板版本：v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-camera</code> </h1>
</p>

本项目基于 [react-native-camera](https://github.com/react-native-camera/react-native-camera/tree/v4.2.1) 开发。

请到三方库的 Releases 发布地址查看配套的版本信息：[@react-native-ohos/react-native-camera Releases](https://github.com/react-native-oh-library/react-native-camera/releases)。对于未发布到npm的旧版本，请参考[安装指南](./tgz-usage.md)安装tgz包。

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| - | - | - | - | - | - | - | - |
| @react-native-ohos/react-native-camera | [~4.0.0 (开发中)](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.84.* | 是 | API12+ | v4.2.1 | [sig](https://github.com/react-native-oh-library/react-native-camera/tree/sig) |
| @react-native-ohos/react-native-camera | [~3.42.0](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.82.* | 是 | API12+ | v3.40.0 | [br_rnoh0.82](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.82) |
| @react-native-ohos/react-native-camera | [~3.41.1](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.77.* | 否 | API12+ | v3.40.0 | [br_rnoh0.77](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.77) |
| @react-native-ohos/react-native-camera | [~3.40.1](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.72.* | 否 | API12+ | v3.40.0 | [br_rnoh0.72](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.72) |

## 简介

react-native-camera 是 React Native 的相机组件，同时支持条码扫描。<br/>
本仓库为 `@react-native-ohos/react-native-camera`，当前版本（4.0.0-beta.1）已适配 RN 0.84 框架，并将社区基线升级至 react-native-camera v4.2.1：JS 层采用 codegen spec（NativeCamera / NativeCameraModule / NativeFaceDetector）接入，鸿蒙侧基于 Camera Kit / AVRecorder 实现预览、拍照、录像与扫码能力。

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

| | 是否支持autolink | RN框架版本 |
| - | - | - |
| ~4.0.0 | 是 | 0.84 |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "file:./react_native_openharmony.har"
  }
}
```

### 2. 引入原生端代码

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
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

# RNOH_BEGIN: manual_package_linking_1
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-camera/src/main/cpp" ./reactNativeCamera)
# RNOH_END: manual_package_linking_1

# RNOH_BEGIN: manual_package_linking_2
+ target_link_libraries(rnoh_app PUBLIC rnoh_native_camera)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
+ #include "NativeCameraPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
+     std::make_shared<NativeCameraPackage>(ctx)
    };
}
```

### 4. 在 ArkTS 侧引入 ReactNativeCameraPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
  ...
+ import ReactNativeCameraPackage from '@react-native-ohos/react-native-camera';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new ReactNativeCameraPackage(ctx)
  ];
}
```

> [!TIP] 本库的 ArkTS 组件（ReactCameraView）由 `ReactNativeCameraPackage` 内部的组件 builder 注册（`createWrappedCustomRNComponentBuilderByComponentNameMap`）自动提供，宿主无需在 `buildCustomRNComponent` 或 `arkTsComponentNames` 中额外配置。
</details>

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

要使用此库，需要使用正确的 React-Native 和 RNOH 版本。另外，还需要使用配套的 DevEco Studio 和 手机 ROM。

在以下版本验证通过：

1. RNOH: 0.84.2; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;

### 编译运行API要求

> [!TIP] 当前三方库所有版本均已实现版本隔离，支持在 `API12+` 工程编译，及 `API12+` ROM运行。

> [!TIP] 以下功能依赖特定版本的API，使用 `低于指定API版本的工程编译` 或 `低于指定API版本的ROM运行` 均可能导致部分功能受限。
1. `whiteBalance` 属性需要在支持 `API20+` 的工程编译，并在支持 `API20+` 的 ROM 上运行，方可生效。

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
  ]
}
```

## 使用示例

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```js
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from "@react-native-ohos/react-native-camera";

export function CameraExample() {
  const cameraRef = React.useRef<RNCamera>(null);

  const takePicture = () => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }
    camera
      .takePictureAsync({ quality: 0.5 })
      .then((photoResult: any) => {
        console.log('takepicture result:' + (photoResult?.path ?? photoResult?.uri));
      })
      .catch((error: unknown) => {
        console.warn('takepicture failed:', error);
      });
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        type="back"
        autoFocus="on"
        flashMode="off"
        videoStabilizationMode="off"
        style={styles.cameraPreview}
      />
      <TouchableOpacity style={styles.actionBtn} onPress={takePicture}>
        <Text style={styles.actionBtnText}>拍照</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraPreview: { width: '100%', aspectRatio: 56 / 100 },
  actionBtn: {
    margin: 10,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 16 },
});
```

## 接口说明

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

### RNCamera

| Name | Description | Type | Required | Platform | HarmonyOS Support |
| ---- | ----------- | ---- | -------- |----------|-------------------|
| children | 设置子组件 | View | no | iOS/Android | yes |
| type | 选择摄像头 | string | no | iOS/Android | yes |
| cameraId | 精确指定摄像头设备（getCameraIdsAsync 返回的 id） | string | no | iOS/Android | yes |
| flashMode | 设置闪光灯 | string | no | iOS/Android | yes |
| exposure | 设置曝光 | number | no | iOS/Android | yes |
| autoFocus | 设置自动对焦 | string | no | iOS/Android | yes |
| whiteBalance | 白平衡 | string | no | iOS/Android | yes |
| captureAudio | 是否开启录音 | boolean | no | iOS/Android | yes |
| zoom | 设置缩放比例 | number | no | iOS/Android | yes |
| focusDepth | 非自动对焦时，设置对焦值 | number | no | iOS/Android | yes |
| maxZoom | 设置最大缩放比例 | number | no | iOS/Android | yes |
| pictureSize | 设置默认图片分辨率 | string | no | iOS/Android | yes |
| playSoundOnRecord | 录制开始/结束时播放系统提示音 | boolean | no | Android | no |
| onCameraReady | 相机就绪回调，无参数 | `() => void` | no | iOS/Android | yes |
| onBarCodeRead | 接收 barcode 扫描数据回调；event 含 data（条码内容）、type（码型）、bounds（位置）等 | `(event: BarCodeReadEvent) => void` | no | iOS/Android | yes |
| onFacesDetected | 接收人脸识别数据回调；response.faces 为人脸数组（harmony 暂不支持） | `(response: {faces: Face[]}) => void` | no | iOS/Android | no |
| onDoubleTap | 双击预览回调；origin 为触点坐标 {x, y}（组件相对坐标） | `(origin: Point) => void` | no | iOS/Android | yes |
| notAuthorizedView | 未授权显示的ui | View | no | Android | no |
| pendingAuthorizationView | 正在授权显示的ui | View | no | Android | no |
| ratio | 相机比例 | string | no | Android | no |
| defaultVideoQuality | 默认视频分辨率 | string | no | iOS/Android | yes |
| autoFocusPointOfInterest | 设置自动对焦点（x/y） | Point | no | iOS/Android | no |
| useNativeZoom | 启用原生捏合缩放手势 | boolean | no | iOS/Android | yes |
| onStatusChange | 相机状态变化回调；event 含 cameraStatus、recordAudioPermissionStatus | `(event: {cameraStatus, recordAudioPermissionStatus}) => void` | no | iOS/Android | yes |
| onMountError | 相机异常回调；error.message 为错误信息 | `(error: {message}) => void` | no | iOS/Android | yes |
| onPictureTaken | 拍照完成回调，无参数 | `() => void` | no | iOS/Android | yes |
| onRecordingStart | 录像开始回调；event.nativeEvent 含 uri、videoOrientation、deviceOrientation | `(event: {nativeEvent: {uri, videoOrientation, deviceOrientation}}) => void` | no | iOS/Android | yes |
| onRecordingEnd | 录像结束回调，无参数 | `() => void` | no | iOS/Android | yes |
| videoStabilizationMode | 视频防抖模式 | string | no | iOS | no |
| barCodeTypes | 条码识别类型数组 | BarCodeType[] | no | iOS/Android | no |
| detectedImageInEvent | 扫码回调携带原始图像 | boolean | no | iOS/Android | no |
| rectOfInterest | 限定条码识别区域 | RectOfInterest | no | iOS/Android | no |
| googleVisionBarcodeType | 条码类型（Google Vision） | enum | no | Android | no |
| googleVisionBarcodeMode | 条码识别模式（Google Vision） | enum | no | Android | no |
| onGoogleVisionBarcodesDetected | Google 条码识别回调 | `(event: {type, barcodes, target}) => void` | no | Android | no |
| onFaceDetectionError | 人脸检测错误回调 | `(response: {isOperational}) => void` | no | iOS/Android | no |
| faceDetectionMode | 人脸检测模式 | string | no | iOS/Android | no |
| faceDetectionLandmarks | 人脸特征点检测 | string | no | iOS/Android | no |
| faceDetectionClassifications | 人脸分类检测 | string | no | iOS/Android | no |
| trackingEnabled | 人脸跟踪 | boolean | no | iOS/Android | no |
| onTextRecognized | 文字识别回调 | `(response: {textBlocks}) => void` | no | iOS/Android | no |
| onTap | 单击预览回调；origin 为触点坐标 {x, y} | `(origin: Point) => void` | no | iOS | no |
| onAudioInterrupted | 音频会话中断回调，无参数 | `() => void` | no | iOS | no |
| onAudioConnected | 音频会话连接回调，无参数 | `() => void` | no | iOS | no |
| onSubjectAreaChanged | 主体区域变化回调 | `(event: {nativeEvent: {prevPoint: {x, y}}}) => void` | no | iOS | no |
| useCamera2Api | 使用 Android Camera2 API | boolean | no | Android | no |
| playSoundOnCapture | 拍照快门音 | boolean | no | Android | no |
| permissionDialogTitle | 权限弹窗标题（已废弃） | string | no | Android | no |
| permissionDialogMessage | 权限弹窗文案（已废弃） | string | no | Android | no |
| androidCameraPermissionOptions | 相机权限弹窗配置 | object | no | Android | no |
| androidRecordAudioPermissionOptions | 录音权限弹窗配置 | object | no | Android | no |
| cameraViewDimensions | 扫码区域尺寸（Android） | object | no | Android | no |
| keepAudioSession | 卸载时不释放音频会话 | boolean | no | iOS | no |

### camera

| Name | Description | Type | Required | Platform | HarmonyOS Support |
| ---- | ----------- | ---- | -------- | --------|-------------------|
| takePictureAsync | 照相；options 可选：quality（0~1）、imageType（jpeg/png）、path 等；resolve 出 TakePictureResponse（width、height、path、pictureOrientation、deviceOrientation） | `(options?: TakePictureOptions) => Promise<TakePictureResponse>` | no | iOS/Android | yes |
| recordAsync | 开始录像；options 可选：quality、maxDuration、maxFileSize、mute、path 等；resolve 出 RecordResponse（uri、videoOrientation、deviceOrientation、isRecordingInterrupted） | `(options?: RecordOptions) => Promise<RecordResponse>` | no | iOS/Android | yes |
| stopRecording | 停止录像，无参数，无返回值；harmony 停录后有转码延迟，待 recordAsync resolve | `() => void` | no | iOS/Android | yes |
| pauseRecording | 暂停录像，无参数，无返回值；仅录像中有效 | `() => void` | no | iOS/Android | yes |
| resumeRecording | 恢复录像，无参数，无返回值；仅暂停后有效 | `() => void` | no | iOS/Android | yes |
| pausePreview | 暂停预览（画面冻结），无参数，无返回值 | `() => void` | no | iOS/Android | yes |
| resumePreview | 恢复预览，无参数，无返回值 | `() => void` | no | iOS/Android | yes |
| getCameraIdsAsync | 获取可用摄像头列表；resolve 出 CameraDeviceInfo[]，成员：{ id: string（设备 id，可设给 cameraId）、type: number（摄像头类型）、deviceType?: string } | `() => Promise<CameraDeviceInfo[]>` | no | iOS/Android | yes |
| getAvailablePictureSizes | 获取可用图片分辨率；resolve 出 string[]，如 "1920x1080" | `() => Promise<string[]>` | no | iOS/Android | yes |
| getSupportedPreviewFpsRange | 获取支持的帧率范围；resolve 出 string[]，每项格式 "min,max" | `() => Promise<string[]>` | no | iOS/Android | yes |
| checkIfVideoIsValid | 校验录像文件是否为有效视频；path 为视频文件路径；返回 true=有效、false=文件不存在或非视频 | `(path: string) => Promise<boolean>` | no | iOS/Android | yes |
| hasTorch | 查询设备是否支持闪光灯；返回 true/false | `() => Promise<boolean>` | no | iOS/Android | yes |
| refreshAuthorizationStatus | 重新请求相机/麦克风权限；resolve 后可读取最新授权状态 | `() => Promise<void>` | no | iOS/Android | yes |
| getSupportedRatiosAsync | 获取支持的预览宽高比；resolve 出 string[]，如 "4:3"、"16:9" | `() => Promise<string[]>` | no | Android | yes |

### Constants

枚举常量经 `RNCamera.Constants` 访问（如 `RNCamera.Constants.FlashMode.torch`），合法成员值如下：

| 枚举 | 对应接口 | 成员值 | HarmonyOS Support |
| ---- | -------- | ------ | ----------------- |
| CameraStatus | onStatusChange 事件 | READY / PENDING_AUTHORIZATION / NOT_AUTHORIZED | partially(READY / NOT_AUTHORIZED) |
| RecordAudioPermissionStatus | onStatusChange 事件 | AUTHORIZED / PENDING_AUTHORIZATION / NOT_AUTHORIZED | partially(AUTHORIZED / NOT_AUTHORIZED) |
| AutoFocus | autoFocus 属性 | on / off | yes |
| FlashMode | flashMode 属性 | on / off / torch / auto | yes |
| CameraType | type 属性 | front / back | yes |
| WhiteBalance | whiteBalance 属性 | sunny / cloudy / shadow / incandescent / fluorescent / auto | yes |
| VideoQuality | defaultVideoQuality 属性、recordAsync 的 quality | 2160p / 1080p / 720p / 480p / 4:3 | yes |
| ImageType | takePictureAsync 的 imageType | jpeg / png | yes |
| Orientation | takePictureAsync / recordAsync 的 orientation | auto / landscapeLeft / landscapeRight / portrait / portraitUpsideDown | no |
| VideoStabilization | videoStabilizationMode 属性 | off / standard / cinematic / auto | no |
| BarCodeType | barCodeTypes 属性 | aztec / code128 / code39 / code39mod43 / code93 / ean13 / ean8 / pdf417 / qr / upc_e / interleaved2of5 / itf14 / datamatrix | no |
| VideoCodec | recordAsync 的 codec（iOS） | H264 / JPEG / HVEC / AppleProRes422 / AppleProRes4444 | no |
| FaceDetection | faceDetectionMode 等属性 | Mode: fast / accurate；Landmarks: all / none；Classifications: all / none | no |
| GoogleVisionBarcodeDetection | googleVisionBarcodeType 等属性（Android） | BarcodeType: CODE_128 / CODE_39 / CODABAR / DATA_MATRIX / EAN_13 / EAN_8 / ITF / QR_CODE / UPC_A / UPC_E / PDF417 / AZTEC / ALL；BarcodeMode: NORMAL / ALTERNATE / INVERTED | no |

## 遗留问题

- [ ] onFacesDetected 人脸检测暂不支持 [issue#8](https://github.com/react-native-oh-library/react-native-camera/issues/8)


## 其他

- notAuthorizedView、pendingAuthorizationView、ratio 是 Android 独有属性；harmony 已提供授权时的系统弹窗。
- playSoundOnRecord 源于 Android 语义（MediaActionSound），OHOS 相机无快门音开关对等 API，当前为 no-op，属性可正常传入不影响其他功能。
- checkIfVideoIsValid 失败语义平台差异：harmony 对"文件不存在/元数据解析失败"返回 false；Android 上游对加载失败保守返回 true。

## 目录结构

````
/react-native-camera                    # 项目根目录
├── harmony                             # 鸿蒙适配代码
│    └── reactNativeCamera.har          # har包
│    └── reactNativeCamera              # 鸿蒙适配核心代码
│          └─ index.ets                 # 鸿蒙适配代码入口
│          └─ src/main/ets              # ArkTS 实现层
│          └─ src/main/cpp              # C++ 层（NativeCameraPackage/Props/RNCCameraModule 等）
├── src                                 # RN 代码
│    └─ index.js                        # 入口文件
│    └─ RNCamera.js / FaceDetector.js   # 组件与能力封装
│    └─ NativeCamera.ts / NativeCameraModule.ts / NativeFaceDetector.ts  # codegen spec
├── types                               # TS 类型定义
├── README.md                           # 中文安装使用方法
├── README_en.md                        # 英文安装使用方法
````

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://github.com/react-native-oh-library/react-native-camera/issues)，当然，也非常欢迎提交 [PR](https://github.com/react-native-oh-library/react-native-camera/pulls) 。

## 开源协议

本项目基于 [MIT License](https://github.com/react-native-camera/react-native-camera/blob/master/LICENSE) ，请自由地享受和参与开源。
