<script lang="ts">
import {defineComponent} from "vue";
import {RouterView} from "vue-router";
import {useNotificationStore} from "@/stores/NotificationStore";
import {NotificationType} from "@/model/UserNotification";
import NotificationComponent from "@/components/NotificationComponent.vue";

export default defineComponent({
  components: {NotificationComponent, RouterView},

  computed: {
    notificationStore() {
      return useNotificationStore();
    }
  },

  methods: {
  }
})
</script>

<template>
  <div class="toast toast-bottom toast-end z-10">
    <NotificationComponent v-for="notification in notificationStore.notifications" :key="notification.id" :notification="notification"/>
  </div>
  <RouterView />
</template>

