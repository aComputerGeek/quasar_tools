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
import { ipcRenderer } from "electron";
import { copyToClipboard } from "quasar";

export default {
  data() {
    return {
      localCode: "",
      remoteCode: "",
      controlText: ""
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
    }
  }
};
</script>

<style lang="sass" scoped></style>
