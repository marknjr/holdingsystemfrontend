<script lang="ts">
import {defineComponent} from 'vue'
import {useDataStore} from "@/stores/DataStore";
import {WsMessageCode} from "@/model/WsMessage";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";

export default defineComponent({
  name: "TermsModal",
  computed: {

    webSocketsStore: () => useWebSocketsStore(),
    bookingEventsStore: () => useBookingEventsStore()
  },
  methods: {
    acceptTerms() {
      let eventIds = [];
      for(const event of this.bookingEventsStore.unenteredEvents)
        eventIds.push(event.id);
      this.webSocketsStore.sendMessage({messageCode: WsMessageCode.EnterEvents, content: eventIds});
    },
  }
})
</script>

<template>
  <input type="checkbox" id="termsModalToggle" class="modal-toggle" :checked="bookingEventsStore.unenteredEvents.length != 0" />
  <div ref="termsModal" class="modal" role="dialog">
    <div class="modal-box" style="max-width: unset">
      <div class="prose" style="max-width: unset">
        <h3 class="font-bold text-lg">Welcome to the TT International Advice Portal.</h3>

        <h4>The following events are about to open:</h4>
        <ul>
          <li v-for="event in bookingEventsStore.unenteredEvents" v-bind:key="event.id">{{event.name}} {{event.arena}} {{event.date}}</li>
        </ul>

        <p>Please be advised that all information provided today is advice based upon the experience and professional
          opinions of the management within TT International. The decision of whether to follow or disregard this advice
          rests solely with you. Additionally, the actions you choose to take regarding any purchased tickets are
          entirely at your discretion. TT has no control over what you do, TT is only here to provide Support if needed
          and advice.</p>

        <p>TT International will offer updates and insights on market movements related to events and the associated
          tickets. This includes our assessment of whether a ticket is in high demand, low demand, or if the market has
          become saturated.</p>

        <p>As a reminder of our primary terms and conditions:</p>
        <ul>
          <li>Users are only permitted to list tickets on the platform that have been purchased under their own name.
          </li>
          <li>Users are required to adhere to the limits set by the promoters.</li>
          <li>Users must effectively demonstrate a reasonable degree of personal usage through their activity on the
            platform.
          </li>
        </ul>

        <p>For a comprehensive understanding of our terms and conditions, please refer to the following link:<br>
          <a href="javascript:void(0)">Terms and Conditions Document</a></p>
        <p>Thank you for choosing the TT International Advice Portal. We look forward to serving your needs.</p>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" @click="acceptTerms()">Accept</button>
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>