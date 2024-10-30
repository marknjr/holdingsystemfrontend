<script lang="ts">
import {defineComponent} from 'vue'
import {useLinksStore} from "@/stores/LinksStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import type Link from "@/model/Link";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {UserType} from "@/model/UserType";
import {useNotificationStore} from "@/stores/NotificationStore";
import {NotificationType} from "@/model/UserNotification";
import axios from "axios";
import AdminLinkRow from "@/components/AdminLinkRow.vue";

export default defineComponent({
  name: "LinkSetModal",
  components: {AdminLinkRow},
  data() {
      return {
        apiURL: import.meta.env.VITE_API_URL
      }
  },
  computed: {
    UserType() {
      return UserType
    },
    linksStore: () => useLinksStore(),
    notificationStore: () => useNotificationStore(),
    authenticationStore: () => useAuthenticationStore(),
    bookingEventsStore: () => useBookingEventsStore(),
    filteredEvents() {
      let r = [];
      for(const event of this.bookingEventsStore.bookingEvents) {
        if(!event.links)
          continue;
        var eventEntry = {
          name: event.name,
          eventId: event.id,
          links: [] as Link[]
        }
        for(const link of event.links) {
          if(this.linksStore.linkSetModalData?.links.includes(link))
            eventEntry.links.push(link);
        }
        if(eventEntry.links.length)
          r.push(eventEntry);
      }
      return r;
    }
  },
  methods: {
    copyListURL() {
      navigator.clipboard.writeText(window.location.origin+"/activate-link-set/"+this.linksStore.linkSetModalData?.access_code);
      this.notificationStore.add(NotificationType.Info, "Link copied to clipboard")
    },

    async openLink(link: Link) {
      try {
        const win = window.open("about:blank", "_blank");
        const response = await axios.post('/users/get-link', {'access_code': link.access_code});
        if (!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Request Error');
          return;
        }
        if (!response.data.success) {
          this.notificationStore.add(NotificationType.Error, response.data.error);
          return;
        }
        if(win)
          win.location.href=response.data.url;
      } catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },

    async openAll() {
      for(const event of this.filteredEvents)
        for(const link of event.links)
          await this.openLink(link);
    },

    copyAll() {
      this.linksStore.copyModalOpen = true;
    },

    copyLink(link: Link) {
      navigator.clipboard.writeText(link.url ?? '');
    }
  }
})
</script>

<template>
  <input type="checkbox" id="linkSetModalOpen" v-model="linksStore.linkSetModalOpen" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box" style="max-width: 90%; width: unset;">
      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="linksStore.linkSetModalOpen = false">✕
      </button>
      <h3 class="font-bold text-xl mx-auto text-center px-10">{{ linksStore.linkSetModalData?.name }}</h3>

      <div v-for="eventEntry in filteredEvents" :key="eventEntry.eventId">
        <h5 class="font-bold text-lg mt-3">{{ eventEntry.name }}</h5>
        <table v-if="!linksStore.copyModalOpen" class="table table-xs z-0">
          <tbody v-if="authenticationStore.userType == UserType.Client">
          <tr v-for="link in eventEntry.links" :key="link.id">
            <td>{{ link.name }}</td>
            <td style="width: 1px">
              <div class="whitespace-nowrap flex flex-row gap-1">
                <button class="btn btn-xs btn-warning flex-grow" @click="openLink(link)">Open</button>
                <button class="btn btn-xs btn-warning flex-grow" @click="copyLink(link)">Copy</button>
              </div>
            </td>
          </tr>
          </tbody>
          <tbody v-else>
          <admin-link-row v-for="link in eventEntry.links" :key="link.id" :link="link"/>
          </tbody>
        </table>
        <div v-else class="border-dashed border-b-neutral-200 border-b-4">
          <p v-for="link in eventEntry.links" :key="link.id">
            <b>{{ link.name }}: </b>
            {{ link.url }}
          </p>
        </div>
      </div>

      <div class="modal-action" v-if="!linksStore.copyModalOpen">
        <template v-if="authenticationStore.userType == UserType.Admin">
          <button class="btn" @click="copyListURL()">Copy List URL</button>
        </template>
        <template v-else>
          <button class="btn" @click="copyAll()">Copy All</button>
          <button class="btn" @click="openAll()">Open All</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>