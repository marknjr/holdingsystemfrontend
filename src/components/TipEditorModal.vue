<script lang="ts">
import {defineComponent} from 'vue'
import type UserTip from "@/model/UserTip";
import {DefaultUserTip} from "@/model/UserTip";
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export default defineComponent({
  name: "TipEditorModal",
  data() {
      return {
        tip: DefaultUserTip(),
        modalOpen: false,
      }
  },
  computed: {
    webSocketsStore: () => useWebSocketsStore(),
  },
  methods: {
    openTip(tip: UserTip) {
      Object.assign(this.tip, tip);
      this.modalOpen = true;
    },
    saveTip() {
      this.webSocketsStore.sendMessage({
        messageCode: this.tip.id ? WsMessageCode.EditUserTip : WsMessageCode.AddUserTip,
        content: this.tip
      });

      this.modalOpen = false;
    },
    deleteTip() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.DeleteUserTip,
        content: this.tip
      });
      this.modalOpen = false
    },
  }
})
</script>

<template>
  <input type="checkbox" :checked="modalOpen" class="modal-toggle"/>
  <div class="modal">
    <div class="modal-box" @submit="saveTip">
      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="modalOpen = false;">✕
      </button>
      <h3 class="font-bold text-lg mx-auto text-center">User Tip Details</h3>
      <form @submit.prevent="saveTip">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Title</span>
          </label>
          <input maxlength="100" v-model="tip.title" type="text" placeholder="Type here"
                 class="input input-bordered w-full"/>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Content</span>
          </label>
          <textarea v-model="tip.content" class="textarea textarea-bordered h-24 w-full"
                    placeholder="Enter text"></textarea>
        </div>
      </form>
      <div class="modal-action">
        <button type="button" v-if="tip.id" class="btn btn-error" @click="deleteTip">Delete</button>
        <button type="button" class="btn btn-success" @click="saveTip">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>