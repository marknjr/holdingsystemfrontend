<script lang="ts">
import {defineComponent} from 'vue'
import {useCommentsStore} from "@/stores/CommentsStore";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {UserType} from "@/model/UserType";
import {DefaultComment} from "@/model/Comment";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {WsMessageCode} from "@/model/WsMessage";
import eventBus from "@/EventBus.js";

export default defineComponent({
  name: "CommentsModal",
  computed: {
    UserType() {
      return UserType
    },
    commentsStore: () => useCommentsStore(),
    authenticationStore: () => useAuthenticationStore(),
    webSocketsStore: () => useWebSocketsStore()
  },
  methods: {
    saveComment() {
      let comment = DefaultComment();
      comment.ticket_submission_id = this.commentsStore.modalSubmission?.id ?? 0;
      comment.content = this.commentsStore.modalMessage;
      this.webSocketsStore.sendMessage({messageCode: WsMessageCode.AddComment, content: comment});
      this.commentsStore.modalMessage = '';
    }
  },
  created() {
      eventBus.on('commentModalOpened', () => {
        setTimeout(() => {
          const container = this.$refs.container as HTMLElement;
          container.scrollTop = container.scrollHeight;
          console.log('scrolled')
        }, 10);
      })
  },
})
</script>

<template>
  <input type="checkbox" id="commentsModalOpen" v-model="commentsStore.modalOpen" class="modal-toggle"/>
  <div class="modal" role="dialog">
    <div class="modal-box pt-10" style="max-width: 90%; width: unset;">
      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="commentsStore.modalOpen = false">✕
      </button>


      <div ref="container" class="overflow-auto h-full" style="max-height: 75vh">
        <div v-for="comment in commentsStore.modalSubmission?.comments" :key="comment.id"
             :class="'chat chat-' + ((comment.by_admin == (authenticationStore.userType == UserType.Admin)) ? 'end' : 'start')">
          <div class="chat-bubble chat-bubble-info">
            {{ comment.content }}
          </div>
        </div>
      </div>


      <div class="modal-action">
        <form @submit.prevent="saveComment()" class="w-full">
          <input type="text" placeholder="Type here" v-model="commentsStore.modalMessage"
                 class="input input-bordered w-full"/>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>