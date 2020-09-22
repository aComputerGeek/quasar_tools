<template>
  <video ref="video" src="" id="screen-video" />
</template>

<script>
import { desktopCapturer, ipcRenderer } from "electron";
import ipc from "app/src-electron/main-process/modules/remoteControl/ipc";

const pc = new window.RTCPeerConnection({});

export default {
  data() {
    return {
      candidates: [] // 需要添加ice 的 任务队列
    };
  },
  mounted() {
    // this.localScreen();
    this.getRemoteScreenStream();
    this.createIceData();

    ipcRenderer.on("answer", (e, answer) => {
      this.setRemote(answer);
    });
  },
  methods: {
    // 正式使用
    getRemoteScreenStream() {
      window.setRemote = this.setRemote;
      this.createOffer().then(offer => {
        ipcRenderer.send("forward", "offer", {
          type: offer.type,
          sdp: offer.sdp
        });
      });
      pc.onaddstream = e => {
        this.play(e.steam);
      };
      this.$once("hook:beforeDestroy", () => {
        pc.onaddstream = null;
      });
    },
    // 仅测试使用
    localScreen() {
      // 监听控制端操作;
      window.onkeydown = this.keyDownhandle;
      window.onmouseup = this.mouseupHandle;
      this.$once("hook:beforeDestroy", () => {
        window.onkeydown = null;
        window.onmouseup = null;
      });
    },
    // 播放视频流
    play(stream) {
      this.$refs.video.srcObject = stream;
      this.$refs.video.onloadeddata = () => {
        this.$refs.video.play();
      };
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
    },

    /**
     * 控制端逻辑
     */
    // 创建offer
    async createOffer() {
      const offer = pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);
      console.log("offer", JSON.stringify(pc.localDescription));
      return pc.localDescription;
    },
    // 接收远程 answer
    async setRemote(answer) {
      await pc.setRemoteDescription(answer);
    },
    /**
     * stun 逻辑
     */
    createIceData() {
      this.candidates = [];
      pc.onicecandidate = function(e) {
        if (e.candidate) {
          ipcRenderer.send("forward", "control-candidate", e.candidate);
        }
      };
      ipcRenderer.on("candidate", (e, candidate) => {
        this.addIceCandidate(candidate);
      });
    },
    async addIceCandidate(candidate) {
      if (candidate) {
        this.candidates.push(candidate);
      }
      // 接收到远程 answer 后， 才可以添加ice
      if (pc.remoteDescription && pc.remoteDescription.type) {
        for (let i = 0; i < this.candidates.length; i++) {
          await pc.addIceCandidate(new RTCIceCandidate(this.candidates[i]));
        }
        this.candidates = [];
      }
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
