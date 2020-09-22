<template>
  <q-layout class="q-electron-drag">
    <q-page-container>
      <q-page class="fit row column justify-center items-center">
        <template v-if="controlText === ''">
          <q-btn
            color="white"
            text-color="black"
            :label="localCode"
            class="q-mt-md"
            @click="copy"
          />
          <q-input v-model="remoteCode" label="输入控制码" />
          <q-btn
            color="white"
            text-color="black"
            label="提交"
            class="q-mt-md"
            @click="startControl"
          />
        </template>
        <q-chip v-else color="primary" text-color="white">{{
          controlText
        }}</q-chip>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { desktopCapturer, ipcRenderer } from "electron";
import { copyToClipboard } from "quasar";

const pc = new window.RTCPeerConnection({});

export default {
  data() {
    return {
      localCode: "",
      remoteCode: "",
      controlText: "",

      candidates: [] // 需要添加ice 的 任务队列
    };
  },
  mounted() {
    this.login();
    ipcRenderer.on("control-state-change", this.handleControlState);
    this.$once("hook:beforeDestroy", () => {
      ipcRenderer.removeListener(
        "control-state-change",
        this.handleControlState
      );
    });

    // stun 逻辑
    this.createIceData();
  },
  methods: {
    async login() {
      let code = await ipcRenderer.invoke("login");
      this.localCode = code;
    },

    handleControlState(e, name, type) {
      console.log(e, name, type);
      let text = "";
      if (type === 1) {
        text = `正在远程控制${name}`;
      } else if (type === 2) {
        text = `被${name}控制中`;
      }
      this.controlText = text;
    },
    copy() {
      copyToClipboard(this.localCode).then(() => {
        // 成功!
        this.$q.notify({
          icon: null,
          message: "复制成功",
          position: "top"
        });
      });
    },
    startControl() {
      ipcRenderer.send("control", this.remoteCode);
    },
    /**
     * 傀儡端逻辑
     */
    // 获取视频流
    async getScreenStream() {
      const sources = await desktopCapturer.getSources({ types: ["screen"] });
      return new Promise((reslove, reject) => {
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
            reslove(stream);
          },
          err => {
            console.error(err);
          }
        );
      });
    },
    // 创建 answer
    async createAnswer(offer) {
      let screenStream = await this.getScreenStream();

      pc.addStream(screenStream);
      await pc.setRemoteDescription(offer);
      await pc.setLocalDescription(await pc.createAnswer());
      console.log("answer", JSON.stringify(pc.localDescription));
      return pc.localDescription;
    },
    /**
     * stun 逻辑
     */
    createIceData() {
      this.candidates = [];
      pc.onicecandidate = function(e) {
        if (e.candidate) {
          ipcRenderer.send("forward", "puppet-candidate", e.candidate);
        }
      };
      ipcRenderer.on("offer", async (e, offer) => {
        let answer = await this.createAnswer(offer);
        ipcRenderer.send("forward", "answer", {
          type: answer.type,
          sdp: answer.sdp
        });
      });
    },
    async addIceCandidate(candidate) {
      if (candidate) {
        this.candidates.push(candidate);
      }
      // 接收到远程 answer 后， 才可以添加ice
      if (pc.remoteDescription && pc.remoteDescription.type) {
        for (let i = 0; i < this.candidates.length; i++) {
          console.log(this.candidates[i], "this.candidates[i],");
          await pc.addIceCandidate(new RTCIceCandidate(this.candidates[i]));
        }
        this.candidates = [];
      }
    }
  }
};
</script>

<style lang="sass" scoped></style>
