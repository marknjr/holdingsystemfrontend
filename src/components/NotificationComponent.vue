<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type UserNotification from "@/model/UserNotification";
import {NotificationType} from "@/model/UserNotification";
import {useNotificationStore} from "@/stores/NotificationStore";

export default defineComponent({
  name: "NotificationComponent",
  props: {
    notification: {
      type: Object as PropType<UserNotification>,
      required: true
    }
  },
  computed: {
    notificationClass() {
      switch (this.notification.type) {
        case NotificationType.Info:
          return 'info';
        case NotificationType.Success:
          return 'success';
        case NotificationType.Error:
          return 'error';
      }
      return '';
    },

    notificationStore() {
      return useNotificationStore()
    }
  },
  mounted() {
    setTimeout(() => {
      this.notificationStore.dismiss(this.notification);
    }, 5000);
  }
})
</script>

<template>
  <div :class="'cursor-pointer alert alert-' + notificationClass" @click="notificationStore.dismiss(notification)">
    <span>{{notification.message}}</span>
  </div>
</template>
