<template>
  <video ref="video" src="" id="screen-video" />
</template>

<script>
import { desktopCapturer, ipcRenderer } from "electron";

export default {
  mounted() {
    // 获取视频流
    this.getScreenStream();
    // 监听控制端操作
    window.onkeydown = this.keyDownhandle;
    window.onmouseup = this.mouseupHandle;
    this.$once("hook:beforeDestroy", () => {
      window.onkeydown = null;
      window.onmouseup = null;
    });
  },
  methods: {
    // 播放视频流
    play(stream) {
      this.$refs.video.srcObject = stream;
      this.$refs.video.onloadeddata = () => {
        this.$refs.video.play();
      };
    },
    // 获取视频流
    async getScreenStream() {
      const sources = await desktopCapturer.getSources({ types: ["screen"] });
      navigator.webkitGetUserMedia(
        {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: sources[0].id,
              maxWidth: window.screen.width,
              maxHeight: window.screen.height
            }
          }
        },
        stream => {
          this.play(stream);
        },
        err => {
          console.error(err);
        }
      );
    },
    // 键盘监听
    keyDownhandle(e) {
      var data = {
        keyCode: e.keyCode,
        shift: e.shiftKey,
        meta: e.metaKey,
        control: e.controlKey,
        alt: e.altKey
      };
      // 传输到主进程
      ipcRenderer.send("robot", "key", data);
    },
    // 鼠标监听
    mouseupHandle(e) {
      let data = {};
      data.clientX = e.clientX;
      data.clientY = e.clientY;
      data.video = {
        width: this.$refs.video.getBoundingClientRect().width,
        height: this.$refs.video.getBoundingClientRect().height
      };

      data.screen = {
        width: window.screen.width,
        height: window.screen.height
      };
      // 传输到主进程
      ipcRenderer.send("robot", "mouse", data);
    }
  }
};
</script>

<style lang="scss" scoped>
#screen-video {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
}
</style>
