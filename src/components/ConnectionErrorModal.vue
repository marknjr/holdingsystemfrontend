<script lang="ts">
import {defineComponent} from 'vue'
import {useDataStore} from "@/stores/DataStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export default defineComponent({
  name: "ConnectionErrorModal",
  computed: {
    webSocketsStore: () => useWebSocketsStore(),
  }
})
</script>

<template>
  <input type="checkbox" :checked="webSocketsStore.errorOnClosedWs && !webSocketsStore.wsIsOpen" class="modal-toggle"/>
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Connection Error</h3>
      <p class="py-4">Server connection lost. Please try refreshing the page.</p>
    </div>
  </div>
</template>

<style scoped>

</style>