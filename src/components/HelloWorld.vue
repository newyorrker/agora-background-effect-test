<template>
  <div class="hello">
    <h1>{{ "some test" }}</h1>

    <div class="vid-container">
      <div>
        <label>test</label>
        <div class="vid video1" ref="video1"></div>
      </div>
      <div>
        <label>main</label>
        <div class="vid video2" ref="video2"></div>
      </div>
    </div>

    <button @click="setBlurToTest">set blur to test</button>
    <button @click="setImageToTest">set image to test</button>
    <br>
    <button @click="apply">apply (set effect only to main track)</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import VirtualBackgroundExtension, { VirtualBackgroundEffectOptions } from "agora-extension-virtual-background";
import AgoraRTC, { ICameraVideoTrack } from "agora-rtc-sdk-ng";
import { AgoraVirtualBackground } from './Extension';
import { AgoraVirtualBackgroundEffect } from './AgoraVirtualBackgroundEffect';

@Component
export default class HelloWorld extends Vue {
  mounted() {
    this.playVideo()
  }

  effect: VirtualBackgroundEffectOptions | null = null

  vt1: ICameraVideoTrack | null = null;
  vt2: ICameraVideoTrack | null = null;

  agoraVirtualBackground1: AgoraVirtualBackground | null = null;
  agoraVirtualBackground2: AgoraVirtualBackground | null = null;

  setBlurToTest() {
    this.effect = { type: "blur" };
    this.agoraVirtualBackground1?.applyEffect(this.effect);
  }

  setImageToTest() {
    const source = document.createElement("img");
    source.crossOrigin = "anonymous";

    source.onload = async () => {
      try {
        this.effect = { type: AgoraVirtualBackgroundEffect.img, source: source };
        this.agoraVirtualBackground1?.applyEffect(this.effect);
      } catch (e) {
        console.error(e);
      }
    }

    source.src = "https://static01.nyt.com/images/2021/09/14/science/07CAT-STRIPES/07CAT-STRIPES-superJumbo.jpg" + '?';
    //
  }

  apply() {
    this.agoraVirtualBackground2?.applyEffect(this.effect);
  }

  async playVideo() {
    const vid1 = this.vt1 = await AgoraRTC.createCameraVideoTrack();
    const vid2 = this.vt2 = await AgoraRTC.createCameraVideoTrack();

    if (vid1 && this.$refs['video1'] && !vid1.isPlaying) {
      vid1?.play(this.$refs['video1'] as HTMLElement);
    }

    if (vid2 && this.$refs['video2'] && !vid2.isPlaying) {
      vid2?.play(this.$refs['video2'] as HTMLElement);
    }

    this.agoraVirtualBackground1 = new AgoraVirtualBackground(new VirtualBackgroundExtension(), this.vt1);
    this.agoraVirtualBackground2 = new AgoraVirtualBackground(new VirtualBackgroundExtension(), this.vt2);
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vid-container {
  display: flex;
  justify-content: space-between;
}
.vid {
  width: 600px;
  height: 400px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
