<script lang="ts">
import {defineComponent} from 'vue'
import type UserTip from "@/model/UserTip";
import {DefaultUserTip} from "@/model/UserTip";
import {WsMessageCode} from "@/model/WsMessage";
import type SortingData from "@/model/SortingData";
import {useDataStore} from "@/stores/DataStore";
import axios from "axios";
import {NotificationType} from "@/model/UserNotification";
import {useNotificationStore} from "@/stores/NotificationStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import {useUserTipsStore} from "@/stores/UserTipsStore";
import {useLinksStore} from "@/stores/LinksStore";
import {useSummaryStore} from "@/stores/SummaryStore";

export default defineComponent({
  name: "AdminSidebar",
  emits: ['openEditTip', 'resetAppClicked'],
  data() {
      return {
        dragDropTip: DefaultUserTip()
      }
  },
  computed: {
    hiddenEvents() {
      return this.bookingEventsStore.bookingEvents.filter(event => this.ticketSubmissionsStore.hiddenEventIds.includes(event.id))
    },
    dataStore: () => useDataStore(),
    webSocketsStore: () => useWebSocketsStore(),
    bookingEventsStore: () => useBookingEventsStore(),
    notificationStore: () => useNotificationStore(),
    ticketSubmissionsStore: () => useTicketSubmissionsStore(),
    userTipsStore: () => useUserTipsStore(),
    linksStore: () => useLinksStore(),
    summaryStore: () => useSummaryStore()
  },
  methods: {
    DefaultUserTip,
    dragTip(userTip: UserTip) {
      Object.assign(this.dragDropTip, userTip);
    },

    dropTip(userTip: UserTip) {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.SortUserTips,
        content: {
          id: this.dragDropTip.id,
          index: this.dragDropTip.priority > userTip.priority ? userTip.priority : userTip.priority + 1
        } as SortingData
      })
    },


    async downloadFile(url: string) {
      try {
        const response = await axios.get('/users/get-download-token');
        if (!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Request Error');
          return;
        }
        if (!response.data.success) {
          this.notificationStore.add(NotificationType.Error, response.data.error);
          return;
        }
        const link = document.createElement('a')
        link.href = axios.defaults.baseURL + url + "?token=" + response.data.token;
        link.click()
        link.remove()
      } catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },
  }
})
</script>

<template>
  <ul class="menu menu-sm bg-base-200 w-full rounded-box">
    <li><a @click="$emit('openEditTip', DefaultUserTip())">Add Tip</a></li>
    <li v-if="userTipsStore.sortedTips.length > 0">
      <details>
        <summary>Tips</summary>
        <ul>
          <li draggable="true" @drag="dragTip(tip)" @drop="dropTip(tip)" @dragover.prevent
              v-for="tip in userTipsStore.sortedTips" :key="tip.id"><a @click="$emit('openEditTip', tip)">{{ tip.title }}</a></li>
        </ul>
      </details>
    </li>
    <li>
      <details>
        <summary>Exports</summary>
        <ul>
          <li><a @click="downloadFile('/admins/summary-export')">Summary Export</a></li>
          <li><a @click="downloadFile('/admins/analysis-export')">Analysis Export</a></li>
          <li><a @click="downloadFile('/admins/presence-export')">Presence Export</a></li>
        </ul>
      </details>
    </li>
    <li v-if="linksStore.linkSets.length > 0">
      <details>
        <summary>Links</summary>
        <ul>
          <li v-for="linkSet in linksStore.linkSets" :key="linkSet.id"><a @click="linksStore.openSetModal(linkSet)">{{ linkSet.name }}</a></li>
        </ul>
      </details>
    </li>
    <li class="disabled"><div class="divider flex gap-0 m-0 cursor-auto"/></li>
    <li v-if="hiddenEvents.length > 0">
      <details>
        <summary>Hidden Events</summary>
        <ul>
          <li v-for="hiddenEvent in hiddenEvents" :key="hiddenEvent.id">
            <a @click="ticketSubmissionsStore.unhideEvent(hiddenEvent.id)">{{ hiddenEvent.name }}</a>
          </li>
        </ul>
      </details>
    </li>
    <li><a @click="ticketSubmissionsStore.hideBought = !ticketSubmissionsStore.hideBought">{{ ticketSubmissionsStore.hideBought ? 'Show' : 'Hide' }} Bought</a></li>
    <li><a @click="ticketSubmissionsStore.hideLost = !ticketSubmissionsStore.hideLost">{{ ticketSubmissionsStore.hideLost ? 'Show' : 'Hide' }} Lost</a></li>
    <li class="disabled"><div class="divider flex gap-0 m-0 cursor-auto"/></li>
    <li>
      <a :class="(ticketSubmissionsStore.counterFlashing ? 'active flash-color-animation' : 'hover:cursor-default hover:bg-[unset]')">Submissions: {{ticketSubmissionsStore.ticketSubmissions.length}}</a>
    </li>
    <li>
      <a class="hover:cursor-default hover:bg-[unset]">Connected Users: {{ dataStore.connectedUsersCount }}</a>
    </li>
    <li>
      <a class="hover:cursor-default hover:bg-[unset]">Active Users: {{ dataStore.connectedUsersCount - dataStore.usersPendingTermsCount }}</a>
    </li>
    <li class="disabled"><div class="divider flex gap-0 m-0 cursor-auto"/></li>
    <li>
      <a class="hover:cursor-default hover:bg-[unset]">Total Spent: {{ summaryStore.predictedCostTotals.bought.toFixed(2) }}</a>
    </li>
  </ul>


  <div class="p-2 gap-2 flex flex-col pb-10">
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/passwords">Passwords</router-link>
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/submissions">Submissions</router-link>
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/events">Events</router-link>
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/admins">Admins</router-link>
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/user-settings">User Settings</router-link> <!-- New Button -->
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/phone-numbers">Phone Numbers</router-link>
    <button @click="$emit('resetAppClicked')" class="btn btn-xs btn-error w-full whitespace-nowrap">Reset
      App
    </button>
  </div>
</template>

