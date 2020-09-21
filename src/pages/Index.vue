<template>
  <q-page class="flex flex-center">
    <q-bar class="q-electron-drag">
      可移动的bar
    </q-bar>
    <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" />

    <q-btn @click="$router.push({ path: '/test1' })">跳转</q-btn>

    <q-btn @click="openRemoteControl">打开远程控制</q-btn>

    <!-- <q-color v-model="hex" class="my-picker" /> -->
  </q-page>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
  name: "PageIndex",
  data() {
    return {
      hex: "#fff"
    };
  },
  methods: {
    openRemoteControl() {
      ipcRenderer.invoke("open-module", {
        name: "remoteControl"
      });
    }
  }
};
</script>
