<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type BookingEvent from "@/model/BookingEvent";
import type TicketSubmission from "@/model/TicketSubmission";
import {PurchaseState, TicketEvaluation} from "@/model/TicketSubmission";
import ClientSubmissionRow from "@/components/ClientSubmissionRow.vue";
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import moment from "moment";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";

export default defineComponent({
  components: {ClientSubmissionRow},
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
    ticketSubmissionsStore: () => useTicketSubmissionsStore(),

    pendingSubmissions() {
      return this.bookingEvent.ticket_submissions.filter(submission => submission.purchase_state == PurchaseState.Pending)
    },

    submitValidation() {
    return {
      quantity: this.tempSubmission.quantity >= 1 && this.tempSubmission.quantity <= 14,
      faceValue: !!this.tempSubmission.face_value
    };
  },
  },

  methods: {
    createSubmission() {
    // Validate quantity range
    if (this.tempSubmission.quantity < 1 || this.tempSubmission.quantity > 14) {
      alert('Quantity must be between 1 and 14.');
      return;
    }

    // Validate other fields if necessary
    for (const validation in this.submitValidation)
      if (!this.submitValidation[validation])
        return;

    this.webSocketsStore.sendMessage({
      messageCode: WsMessageCode.AddTicketSubmission,
      content: this.tempSubmission
    });

    this.resetFields();
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
  <tr class="bg-blue-300">
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Waiting Room')" rowspan="2" class="whitespace-nowrap">{{ bookingEvent.waiting_room ? moment.utc(bookingEvent.waiting_room).format('DD/MM/YYYY HH:mm:ss') : '' }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('OnSale Time')" rowspan="2" class="whitespace-nowrap">{{ bookingEvent.onsale_time ? moment.utc(bookingEvent.onsale_time).format('DD/MM/YYYY HH:mm:ss') : '' }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Passed')" rowspan="2"></td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Event')" rowspan="2" class="whitespace-nowrap">{{ bookingEvent.name }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Arena')" rowspan="2" class="whitespace-nowrap">{{ bookingEvent.arena }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Day')" rowspan="2" class="whitespace-nowrap">{{ bookingEvent.day }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Date')" rowspan="2" class="whitespace-nowrap">{{ moment.utc(bookingEvent.date).format('DD/MM/YYYY') }}</td>
    <td><input v-if="bookingEvent.canAddSubmissions" type="text" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempSubmission.block" /></td>
    <td><input v-if="bookingEvent.canAddSubmissions" type="text" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempSubmission.row" /></td>
    <td>
      <div v-if="bookingEvent.canAddSubmissions" class="flex gap-1">
        <input type="text" class="input input-bordered input-xs w-full max-w-xs grow"  v-model="tempSubmission.seats" />
        <button v-if="tempSubmission.seats != 'Standing'" @click="tempSubmission.seats = 'Standing'" class="btn btn-xs ">Standing</button>
      </div>

    </td>
    <td>
  <input
    v-if="bookingEvent.canAddSubmissions"
    type="number"
    step="1"
    min="1"
    max="14"
    :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.quantity ? '' : ' input-error')"
    v-model="tempSubmission.quantity"
  />
</td>
    <td><input v-if="bookingEvent.canAddSubmissions" type="number" step="0.01" min="1" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.faceValue ? '' : ' input-error')" v-model="tempSubmission.face_value" /></td>
    <template v-if="bookingEvent.paused">
      <td rowspan="2" colspan="6" style="vertical-align: middle!important;">
        This market is now saturated, we are no longer giving advice on this event
      </td>
    </template>
    <template v-else>
      <td rowspan="2"><input v-if="bookingEvent.canAddSubmissions" type="text" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempSubmission.primary_info" /></td>
      <td rowspan="2"><input v-if="bookingEvent.canAddSubmissions" type="text" :class="'input input-bordered input-xs w-full max-w-xs'" v-model="tempSubmission.notes" /></td>
      <td rowspan="2"></td>
      <td rowspan="2"></td>
      <td rowspan="2"></td>
      <td rowspan="2">
        <button v-if="bookingEvent.canAddSubmissions" class="btn btn-xs btn-warning w-full" @click="createSubmission()">Submit</button>
      </td>
    </template>
  </tr>
  <tr class="bg-blue-300">
    <td colspan="3">{{ bookingEvent.filters }}</td>
    <td>Limit: {{ bookingEvent.limits }}</td>
    <td>Exp. Price: {{ bookingEvent.expected_price }}</td>
  </tr>
  <client-submission-row v-for="ticketSubmission in pendingSubmissions" :key="ticketSubmission.id" :ticket-submission="ticketSubmission"/>
</template>

<style scoped>
  td {
    vertical-align: baseline!important;
  }

  .input {
    min-width: 80px;
  }
</style>