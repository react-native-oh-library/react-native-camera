/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
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

