<script lang="ts">
import {defineComponent} from 'vue'
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export default defineComponent({
  name: "EventUnlockModal",
  data() {
      return {
        unlockPassword: '',
      }
  },
  computed: {
    webSocketsStore: () => useWebSocketsStore(),
    unlockEventModal() {
      return this.$refs.unlockEventModal as HTMLDialogElement;
    },
  },
  methods: {
    sendUnlockEvent() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.UnlockEvent,
        content: {password: this.unlockPassword}
      });
      this.unlockEventModal.close();
      this.unlockPassword = '';
    },
    openModal() {
      this.unlockEventModal.showModal()
    }
  }
})
</script>

<template>
  <dialog ref="unlockEventModal" class="modal">
    <div class="modal-box" @submit="sendUnlockEvent">
      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="unlockEventModal.close()">✕
      </button>
      <h3 class="font-bold text-lg mx-auto text-center">Unlock Event</h3>
      <form @submit.prevent>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input maxlength="50" v-model="unlockPassword" type="text" placeholder="Type here"
                 class="input input-bordered w-full"/>
        </div>
      </form>
      <div class="modal-action">
        <button type="button" class="btn btn-success" @click="sendUnlockEvent">Unlock</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>