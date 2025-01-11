import { RNComponentContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { RNC } from "./generated/ts"

@Component
export struct RNCamera {
  public static readonly NAME = RNC.RNCamera.NAME
  public ctx!: RNComponentContext
  public tag: number = 0
  // 组件的状态包装器
  @State private descriptorWrapper: RNC.RNCamera.DescriptorWrapper =
    {} as RNC.RNCamera.DescriptorWrapper
  private eventEmitter: RNC.RNCamera.EventEmitter | undefined = undefined
  // 存储需要在组件卸载时清理的回调函数
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    // 创建EventEmitter实例，用于处理事件的订阅和触发
    this.eventEmitter = new RNC.RNCamera.EventEmitter(this.ctx.rnInstance, this.tag)
    this.executeCommand()
    // 处理组件初始状态
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<RNC.RNCamera.DescriptorWrapper>(this.tag)!)
    // 订阅组件状态的变化，然后放入cleanUpCallbacks等待清理
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        // 更新组件状态
        this.onDescriptorWrapperChange(newDescriptorWrapper! as RNC.RNCamera.DescriptorWrapper)
      }
    ))
  }

  executeCommand() {
    this.cleanUpCallbacks.push(this.ctx.componentCommandReceiver.registerCommandCallback(
      this.tag,
      (command: string, args: string[]) => this.registerCommandCallback(command, args)))
  }

  registerCommandCallback(commandName: string, args: string[]) {
    switch (commandName) {
      case 'takePictureAsync':
        console.log('registerCommandCallback takePictureAsync')
        break
      case 'recordAsync':
        console.log('registerCommandCallback recordAsync')
        break
      case 'refreshAuthorizationStatus':
        console.log('registerCommandCallback refreshAuthorizationStatus')
        break
      case 'stopRecording':
        console.log('registerCommandCallback stopRecording')
        break
      case 'pausePreview':
        console.log('registerCommandCallback pausePreview')
        break
      case 'resumePreview':
        console.log('registerCommandCallback resumePreview')
        break
      case 'getAvailablePictureSizes':
        console.log('registerCommandCallback getAvailablePictureSizes')
        break
      case 'getSupportedRatiosAsync':
        console.log('registerCommandCallback getSupportedRatiosAsync')
        break
      case 'isRecording':
        console.log('registerCommandCallback isRecording')
        break
      default:
        break
    }
  }

  // 更新组件状态
  private onDescriptorWrapperChange(descriptorWrapper: RNC.RNCamera.DescriptorWrapper) {
    this.descriptorWrapper = descriptorWrapper
  }

  aboutToDisappear() {
    // 执行所有清理回调
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Column() {
        Text(`RNCamera now is an empty implementation, please supplement`).fontSize(16)
      }.margin({ top: 30, left: 0 }).width('100%').alignItems(HorizontalAlign.Start)
    }
  }
}
