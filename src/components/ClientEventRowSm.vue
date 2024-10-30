<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type BookingEvent from "@/model/BookingEvent";
import type TicketSubmission from "@/model/TicketSubmission";
import {PurchaseState, TicketEvaluation} from "@/model/TicketSubmission";
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import moment from "moment";
import ClientSubmissionRowSm from "@/components/ClientSubmissionRowSm.vue";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export default defineComponent({
  components: {ClientSubmissionRowSm},
  emits: ['openAddSubmission', 'openEditSubmission'],
  props: {
    bookingEvent: {
      type: Object as PropType<BookingEvent>,
      required: true
    }
  },

  data() {
    return {
      tempSubmission: {
        id: 0,
        booking_event_id: this.bookingEvent.id,
        booking_event: null,
        block: '',
        row: '',
        seats: '',
        quantity: 0,
        face_value: 0,
        primary_info: '',
        notes: '',
        evaluation: TicketEvaluation.Pending,
        purchase_state: PurchaseState.Pending
      } as TicketSubmission
    }
  },

  computed: {
    PurchaseState() {
      return PurchaseState
    },
    moment() {
      return moment
    },

    webSocketsStore: () => useWebSocketsStore(),

    pendingSubmissions() {
      return this.bookingEvent.ticket_submissions.filter(submission => submission.purchase_state == PurchaseState.Pending)
    }
  },

  methods: {
    createSubmission() {

      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.AddTicketSubmission,
        content: this.tempSubmission
      });

      this.resetFields();
    },

    editSubmission(submission: TicketSubmission) {
      this.$emit('openEditSubmission', submission);
    },

    resetFields() {
      this.tempSubmission = {
        id: 0,
        booking_event_id: this.bookingEvent.id,
        booking_event: null,
        block: '',
        row: '',
        seats: '',
        quantity: 0,
        face_value: 0,
        primary_info: '',
        notes: '',
        evaluation: TicketEvaluation.Pending,
        purchase_state: PurchaseState.Pending
      } as TicketSubmission
    },



  },
})
</script>

<template>



  <div class="collapse bg-base-300 text-sm overflow-visible">
    <input type="checkbox" checked />
    <div class="collapse-title py-2 px-3">

      <div class="flex justify-between text-xs text-orange-600 font-medium">
        <p v-if="bookingEvent.onsale_time" class="flex gap-1 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M13.92 3.845a19.361 19.361 0 01-6.3 1.98C6.765 5.942 5.89 6 5 6a4 4 0 00-.504 7.969 15.974 15.974 0 001.271 3.341c.397.77 1.342 1 2.05.59l.867-.5c.726-.42.94-1.321.588-2.021-.166-.33-.315-.666-.448-1.004 1.8.358 3.511.964 5.096 1.78A17.964 17.964 0 0015 10c0-2.161-.381-4.234-1.08-6.155zM15.243 3.097A19.456 19.456 0 0116.5 10c0 2.431-.445 4.758-1.257 6.904l-.03.077a.75.75 0 001.401.537 20.902 20.902 0 001.312-5.745 1.999 1.999 0 000-3.545 20.902 20.902 0 00-1.312-5.745.75.75 0 00-1.4.537l.029.077z" />
          </svg>
          {{ moment.utc(bookingEvent.onsale_time).format('DD/MM/YYYY HH:mm:ss') }}
        </p>

        <p v-if="bookingEvent.waiting_room" class="flex gap-1 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z" clip-rule="evenodd" />
          </svg>
          {{ moment.utc(bookingEvent.waiting_room).format('DD/MM/YYYY HH:mm:ss') }}
        </p>
      </div>

      <div class="flex justify-between items-center py-2 pe-4">
        <div>
          <p class="text-xl font-medium">{{ bookingEvent.name }}</p>
          <p v-if="bookingEvent.paused" class="text-xs text-orange-600">This market is now saturated, we are no longer giving advice on this event</p>
        </div>
        <button v-if="!bookingEvent.paused" class="btn btn-square btn-sm z-[5] relative" @click="$emit('openAddSubmission', bookingEvent)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      <div class="flex justify-between text-xs whitespace-nowrap flex-wrap text-gray-600 ">
        <p class="flex gap-1 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
            <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
          </svg>
          {{ bookingEvent.arena }}
        </p>

        <p class="flex gap-1 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
          </svg>
          {{ moment.utc(bookingEvent.date).format('DD/MM/YYYY') }}
        </p>
        <p class="flex gap-1 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
          </svg>
          {{ bookingEvent.day }}
        </p>

      </div>
    </div>
    <div class="collapse-content overflow-auto bg-base-100 border-base-300 border-2 p-0">
      <table class="table table-xs w-full">
        <thead class="table-xs">
        <tr>
          <th>Block</th>
          <th>Row</th>
          <th>Seats</th>
          <th>Quantity</th>
          <th>FV</th>
          <th>Primary</th>
          <th>Note</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <client-submission-row-sm v-for="ticketSubmission in pendingSubmissions" :key="ticketSubmission.id" :ticket-submission="ticketSubmission" @open-edit-submission="editSubmission"/>
        </tbody>
      </table>
    </div>
  </div>


</template>

<style scoped>
td {
  vertical-align: baseline!important;
}
</style>