<script lang="ts">
import {defineComponent} from 'vue';
import {useDataStore} from "@/stores/DataStore";
import PageWrapper from "@/components/PageWrapper.vue";
import AdminEventRow from "@/components/AdminEventRow.vue";
import {WsMessageCode} from "@/model/WsMessage";
import type BookingEvent from "@/model/BookingEvent";
import type SortingData from "@/model/SortingData";
import {EmptyBookingEvent} from "@/model/BookingEvent";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";

export default defineComponent({
  name: "EventsView",
  components: {AdminEventRow, PageWrapper},

  data() {
    return {
      tempEvent: {...EmptyBookingEvent},

      dragTempEvent: {...EmptyBookingEvent},
    }
  },

  computed: {

    submitValidation() {
      return {
        name: !!this.tempEvent.name,
        arena: !!this.tempEvent.arena,
        day: !!this.tempEvent.day,
        date: !!this.tempEvent.date,
        filters: !!this.tempEvent.filters,
        expected_price: !!this.tempEvent.expected_price,
        limits: !!this.tempEvent.limits,
      } as any
    },


    webSocketsStore: () => useWebSocketsStore(),
    bookingEventsStore: () => useBookingEventsStore(),
  },

  methods: {
    createEvent() {

      for(const validation in this.submitValidation)
        if(!this.submitValidation[validation])
          return;

      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.AddBookingEvent,
        content: this.tempEvent
      });
      this.resetFields();
    },

    duplicateEvent(bookingEvent: BookingEvent) {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.AddBookingEvent,
        content: bookingEvent
      });
    },

    resetFields() {
      this.tempEvent = {...EmptyBookingEvent};
    },

    dragEvent(bookingEvent: BookingEvent) {
      Object.assign(this.dragTempEvent, bookingEvent);
    },


    dropEvent(bookingEvent: BookingEvent) {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.SortBookingEvents,
        content: {
          id: this.dragTempEvent.id,
          index: this.dragTempEvent.priority > bookingEvent.priority ? bookingEvent.priority : bookingEvent.priority + 1
        } as SortingData
      })
    }
  },
})
</script>

<template>
  <page-wrapper>
    <table class="table table-xs table-pin-rows z-0">
      <thead class="table-md">
      <tr>
        <th>Waiting Room</th>
        <th>OnSale Time</th>
        <th>Name</th>
        <th>Arena</th>
        <th>Day</th>
        <th>Date</th>
        <th>Filters</th>
        <th>Expected Price</th>
        <th>Limits</th>
        <th>Password</th>
        <th>Links</th>
        <th>Paused</th>
        <th class="w-[150px]"></th>
      </tr>
      </thead>
      <tbody>
      <tr class="bg-blue-200">
        <td><input type="datetime-local" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempEvent.waiting_room" /></td>
        <td><input type="datetime-local" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempEvent.onsale_time" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.name ? '' : ' input-error')" v-model="tempEvent.name" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.arena ? '' : ' input-error')" v-model="tempEvent.arena" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.day ? '' : ' input-error')" v-model="tempEvent.day" /></td>
        <td><input type="date" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.date ? '' : ' input-error')" v-model="tempEvent.date" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.filters ? '' : ' input-error')" v-model="tempEvent.filters" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.expected_price ? '' : ' input-error')" v-model="tempEvent.expected_price" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.limits ? '' : ' input-error')" v-model="tempEvent.limits" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempEvent.password" /></td>
        <td></td>
        <td><input type="checkbox" class="toggle toggle-warning toggle-sm" v-model="tempEvent.paused" /></td>
        <td>
          <button class="btn btn-xs btn-warning w-full" @click="createEvent()">Submit</button>
        </td>
      </tr>
      <admin-event-row @drag="dragEvent(bookingEvent)" @drop="dropEvent(bookingEvent)" @duplicate="duplicateEvent(bookingEvent)" v-for="bookingEvent in bookingEventsStore.sortedEvents" :key="bookingEvent.id" :booking-event="bookingEvent"/>
      </tbody>
    </table>
  </page-wrapper>
</template>