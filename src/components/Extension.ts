import VirtualBackgroundExtension, { IVirtualBackgroundProcessor, VirtualBackgroundEffectOptions } from "agora-extension-virtual-background";
import AgoraRTC, { ILocalVideoTrack } from "agora-rtc-sdk-ng";
import { AgoraVirtualBackgroundEffect } from "./AgoraVirtualBackgroundEffect";

export class AgoraVirtualBackground {

    processor: IVirtualBackgroundProcessor | null = null;
    track: ILocalVideoTrack | null = null;

    constructor(public extension: VirtualBackgroundExtension, track: ILocalVideoTrack | null) {
        if (!extension) {
            throw new Error("Agora extension is not defined")
        }

        this.track = track;

        AgoraRTC.registerExtensions([extension]);
    }

    /**
     * Apply effect to passed videoTrack
     * @param videoTrack
     * @param backgroundEffectData
     */
    async applyEffect(backgroundEffectData: VirtualBackgroundEffectOptions | null) {
        if (!this.track) {
            throw new Error("track is not set. Please set the track first")
        }

        if (!backgroundEffectData?.type) {
            await this.disable();
            return
        }

        switch (backgroundEffectData.type) {
            case AgoraVirtualBackgroundEffect.blur:
                await this.enableBlurring();
                break;

            case AgoraVirtualBackgroundEffect.img:
                await this.enableBackgroundImage(backgroundEffectData);
                break;

            default:
                break;
        }
    }

    // J:9428 - it is something inside processor, having methods setBackgroundBlur, setBackgroundImage etc
    private async createProcessor(track: ILocalVideoTrack | null) {
        if (!this.processor) {
            const processor = this.extension.createProcessor();

            try {
                // Initialize the extension and pass in the URL of the Wasm file
                await processor?.init("./assets/wasms");
            } catch (e) {
                throw new Error("Fail to load WASM resource!");
            }

            track?.pipe(processor).pipe(track?.processorDestination);

            this.processor = processor;
        }

        return this.processor;
    }

    /**
     * Enable background bluring
     */
    async enableBlurring() {
        const processor = await this.createProcessor(this.track);

        processor?.setOptions({ type: 'blur', blurDegree: 3 });
        await processor?.enable();
    }

    /**
     * Enable replacing background
     */
    async enableBackgroundImage(options: VirtualBackgroundEffectOptions) {
        if (options.source) {
            const processor = await this.createProcessor(this.track);

            processor?.setOptions(options);
            await processor?.enable();
        }
    }

    changeBackgroundImage() {
        throw new Error("Method not implemented.");
    }

    unpipe() {
        this.processor?.unpipe();
    }

    async disable() {
        await this.processor?.disable();
    }

    async resetTrack(track: ILocalVideoTrack | null) {
        const processor = await this.createProcessor(this.track);

        //reset old processor and track
        processor.unpipe()
        await processor.disable();
        this.track?.unpipe();

        //set new track and pipe
        this.track = track;
        track?.pipe(processor).pipe(track.processorDestination);
    }

    get hasTrack() {
        return Boolean(this.track);
    }

    /**
     * unpipe last track, disable and remove processor
     */
    destroy() {
        // this.processor?.disable();
        this.processor?.unpipe();
        this.processor = null;
    }
}