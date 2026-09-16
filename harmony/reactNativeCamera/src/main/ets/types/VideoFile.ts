/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the MIT License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://github.com/react-native-camera/react-native-camera/blob/v4.2.1/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { Orientation } from '../core/CameraEnumBox';
import type { CameraCaptureError } from './CameraError'
import type { TemporaryFile } from './TemporaryFile'

export interface RecordVideoOptions {
  quality?:string,
  orientation?: Orientation;
  maxDuration?: number;
  maxFileSize?: number;
  codec?: 'h264' | 'h265';
  mute?: boolean;
  mirrorVideo?: boolean;
  path?: string;
  videoBitRate?: number;
  fps?:number;
}

export interface VideoFile extends TemporaryFile {
  duration: number
  width: number
  height: number
}

// export interface RecordVideoOptions {
//   flash?: 'on' | 'off'
//   fileType?: 'mov' | 'mp4'
//   onRecordingError: (error: CameraCaptureError) => void
//   onRecordingFinished: (video: VideoFile) => void
//   videoCodec?: 'h264' | 'h265'
//   videoBitRate?: 'extra-low' | 'low' | 'normal' | 'high' | 'extra-high' | number
// }
//
// export interface VideoFile extends TemporaryFile {
//   duration: number
//   width: number
//   height: number
// }

