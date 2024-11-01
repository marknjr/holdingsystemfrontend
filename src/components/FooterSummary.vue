<script lang="ts">
import {defineComponent} from 'vue'
import {useDataStore} from "@/stores/DataStore";
import {useSummaryStore} from "@/stores/SummaryStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";

export default defineComponent({
  name: "FooterSummary",
  data() {
      return {
      }
  },
  computed: {
    summaryStore: () => useSummaryStore(),
    bookingEventsStore: () => useBookingEventsStore(),

    totalTickets() {
      return this.bookingEventsStore.bookingEvents.reduce((total, event) => {
        return total + (this.summaryStore.purchaseCounters[event.id]?.quantity || 0);
      }, 0);
    },

    // Computed property for total spend
    totalSpend() {
      return this.bookingEventsStore.bookingEvents.reduce((total, event) => {
        return total + (this.summaryStore.purchaseCounters[event.id]?.predictedValue || 0);
      }, 0).toFixed(2); // Format to 2 decimal places
    }

  }
})
</script>

<template>
  <div class="collapse lg:collapse-open bg-base-200 lg:bg-base-200 max-h-[200px] lg:max-h-[150px]">
    <input type="checkbox" class="hidden" v-model="summaryStore.showSummary"/>
    <div class="collapse-content m-2 overflow-auto" style="min-height: unset">
      <table class="table table-pin-rows text-xs">
        <thead>
        <tr>
          <th>Event</th>
          <th>Arena</th>
          <th>Date</th>
          <th>Bought</th>
          <th>Pending</th>
          <th>Lost</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="bookingEvent in bookingEventsStore.bookingEvents" :key="bookingEvent.id">
          <td>{{ bookingEvent.name }}</td>
          <td>{{ bookingEvent.arena }}</td>
          <td>{{ bookingEvent.date }}</td>
          <td>{{ summaryStore.purchaseCounters[bookingEvent.id].quantity }} (predicted: {{ summaryStore.purchaseCounters[bookingEvent.id].predictedValue.toFixed(2) }})</td>
          <td>{{ summaryStore.pendingCounters[bookingEvent.id].quantity }} (predicted: {{ summaryStore.pendingCounters[bookingEvent.id].predictedValue.toFixed(2) }})</td>
          <td>{{ summaryStore.lostCounters[bookingEvent.id].quantity }} (predicted: {{ summaryStore.lostCounters[bookingEvent.id].predictedValue.toFixed(2) }})</td>
        </tr>

        <tr class="font-bold">
            <td colspan="3" class="text-right">Total:</td>
            <td>{{ totalTickets }}</td>
            <td></td>
            <td>{{ totalSpend }}</td>
          </tr>
          
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>