<script lang="ts">
import {defineComponent} from 'vue'
import axios from "axios";
import {NotificationType} from "@/model/UserNotification";
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import {useNotificationStore} from "@/stores/NotificationStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export default defineComponent({
  name: "ResetAppModal",
  computed: {
    webSocketsStore: () => useWebSocketsStore(),
    notificationStore() {
      return useNotificationStore();
    },
  },
  methods: {
    async resetApp() {
      try {
        const response = await axios.post('/admins/reset-app');
        if (!response || response.status != 200) {
          return;
        }
        if (!response.data.success) {
          this.notificationStore.add(NotificationType.Error, response.data.error);
          return;
        }

        this.webSocketsStore.sendMessage({
          messageCode: WsMessageCode.ResetApp,
          content: ''
        })
      } catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },
    openModal() {
      (this.$refs.resetAppModal as HTMLDialogElement).showModal()
    }
  }
})
</script>

<template>
  <dialog ref="resetAppModal" class="modal">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg pb-4">Reset All Data</h3>
      <p>Are you sure you want to erase all event and submission data?</p>
      <div class="modal-action pt-4">
        <button class="btn btn-ghost">Close</button>
        <button class="btn btn-error" @click="resetApp">Reset</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>

</style>