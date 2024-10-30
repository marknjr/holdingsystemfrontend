<script lang="ts">
import {defineComponent} from 'vue';
import ClientEventRow from "@/components/ClientEventRow.vue";
import {useDataStore} from "@/stores/DataStore";
import PageWrapper from "@/components/PageWrapper.vue";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";

export default defineComponent({
  name: "ClientView.vue",
  computed: {

    ticketSubmissionsStore: () => useTicketSubmissionsStore(),
    bookingEventsStore: () => useBookingEventsStore(),

  },
  components: {PageWrapper, ClientEventRow},
})
</script>

<template>
  <page-wrapper>
    <table class="table table-xs table-pin-rows z-0">
      <thead class="table-md">
      <tr>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Waiting Room')">
          Waiting Room
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('Waiting Room')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('OnSale Time')">
          OnSale Time
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('OnSale Time')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Passed')">
          Passed
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('Passed')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Event')">
          Event
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('Event')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Arena')">
          Arena
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('Arena')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Day')">
          Day
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('Day')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Date')">
          Date
          <button @click="ticketSubmissionsStore.hideSubmissionColumn('Date')" class="btn btn-link" style="min-height: unset; height: unset; padding: unset; display: inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </th>
        <th>Block</th>
        <th>Row</th>
        <th>Seats</th>
        <th>Quantity</th>
        <th>Face Value per Ticket</th>
        <th>Primary</th>
        <th>Note</th>
        <th>Comments</th>
        <th>1m</th>
        <th>LP</th>
        <th class="min-w-[180px]">
          <details v-if="ticketSubmissionsStore.hiddenSubmissionColumns.length > 0" class="dropdown dropdown-end">
            <summary class="btn btn-xs btn-link">Hidden Columns</summary>
            <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
              <li v-for="column in ticketSubmissionsStore.hiddenSubmissionColumns" :key="column"><a @click="ticketSubmissionsStore.showSubmissionColumn(column)">{{ column }}</a></li>
            </ul>
          </details>
        </th>
      </tr>
      </thead>
      <tbody>
      <client-event-row v-for="bookingEvent in bookingEventsStore.sortedEvents" :key="bookingEvent.id" :booking-event="bookingEvent"/>
      </tbody>
    </table>
  </page-wrapper>
</template>

