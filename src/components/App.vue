<template>
  <Layout>
    <template #primary-header>
      <router-link :to="{ name: 'home' }" class="font-bold">
        OpenDeck UI
      </router-link>
    </template>

    <template #secondary-header>
      <router-link
        v-if="!isHomePage && boardName"
        :to="{ name: 'device', params: { inputId } }"
        class="font-bold"
      >
        {{ boardName }}
        <small v-if="firmwareVersion">- Firmware {{ firmwareVersion }} </small>
      </router-link>
    </template>

    <template #sidebar>
      <DeviceNav v-if="!isHomePage" />
    </template>

    <div class="w-full">
      <Section
        v-if="isConnecting"
        class="h-screen"
        title="Establishing connection"
      >
        <div
          class="lg:text-center max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <p>WebMidi connecting</p>
        </div>
      </Section>
      <Section
        v-else-if="!isConnected"
        class="h-screen"
        title="Problem connecting"
      >
        <div
          class="lg:text-center max-w-screen-xl mx-auto px-4 pt-24 sm:px-6 lg:px-8"
        >
          <p>WebMidi failed to conect</p>
        </div>
      </Section>
      <router-view v-else />
    </div>

    <template #secondary-footer>
      <h3 class="font-bold text-gray-500">About</h3>
      <p class="py-4 text-gray-600 text-xs max-w-md">
        OpenDeck is a platform suited both for prototyping and developing custom
        MIDI controllers. Platform uses class-compliant USB MIDI which makes it
        compatible with any MIDI software on any OS.
      </p>
    </template>

    <template #primary-footer>
      <h3 class="font-bold text-gray-500">Resources</h3>
      <ul class="list-reset items-center text-xs pt-3">
        <li>
          <a
            class="inline-block text-gray-600 no-underline hover:text-gray-900 hover:underline py-1"
            href="https://github.com/paradajz/OpenDeck"
            >OpenDeck GitHub repository</a
          >
        </li>
        <li>
          <a
            class="inline-block text-gray-600 no-underline hover:text-gray-900 hover:underline py-1"
            href="https://shanteacontrols.com/"
            >Shantea controls</a
          >
        </li>
      </ul>
    </template>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { midiStoreMapped, deviceStoreMapped } from "../store";
import router from "../router";
import Layout from "./layout/Layout.vue";
import DeviceNav from "./device/DeviceNav.vue";

export default defineComponent({
  name: "App",
  setup() {
    midiStoreMapped.loadMidi();
    const { inputId, boardName, firmwareVersion } = deviceStoreMapped;
    const isHomePage = computed(
      () => router.currentRoute.value.name === "home"
    );

    const { isConnected, isConnecting } = midiStoreMapped;

    return {
      isHomePage,
      inputId,
      isConnected,
      isConnecting,
      boardName,
      firmwareVersion,
    };
  },
  components: {
    Layout,
    DeviceNav,
  },
});
</script>
