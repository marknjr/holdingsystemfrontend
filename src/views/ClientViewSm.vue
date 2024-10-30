<script lang="ts">
import {defineComponent} from 'vue';
import {useDataStore} from "@/stores/DataStore";
import PageWrapper from "@/components/PageWrapper.vue";
import ClientEventRowSm from "@/components/ClientEventRowSm.vue";
import type TicketSubmission from "@/model/TicketSubmission";
import {EmptySubmission} from "@/model/TicketSubmission";
import {WsMessageCode} from "@/model/WsMessage";
import type BookingEvent from "@/model/BookingEvent";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";

export default defineComponent({
  name: "ClientViewSm.vue",
  data() {
    return {
      tempSubmission: {...EmptySubmission}
    }
  },
  computed: {

    webSocketsStore: () => useWebSocketsStore(),
    bookingEventsStore: () => useBookingEventsStore(),

    submissionModal() {
      return this.$refs.submissionModal as HTMLDialogElement;
    },
  },

  methods: {
    saveSubmission() {
      this.webSocketsStore.sendMessage({
        messageCode: this.tempSubmission.id ? WsMessageCode.EditTicketSubmission : WsMessageCode.AddTicketSubmission,
        content: this.tempSubmission
      });
      this.submissionModal.close();
    },

    deleteSubmission() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.DeleteTicketSubmission,
        content: this.tempSubmission
      });
      this.submissionModal.close();
    },

    openEditSubmission(submission: TicketSubmission) {
      Object.assign(this.tempSubmission, submission);
      this.submissionModal.showModal();
    },

    openNewSubmission(bookingEvent: BookingEvent) {
      Object.assign(this.tempSubmission, EmptySubmission);
      this.tempSubmission.booking_event_id = bookingEvent.id;
      this.tempSubmission.booking_event = bookingEvent;
      this.submissionModal.showModal();
    }
  },
  components: {ClientEventRowSm, PageWrapper},
})
</script>

<template>
  <page-wrapper>
    <dialog ref="submissionModal" class="modal">
      <div class="modal-box" @submit="saveSubmission">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                @click="submissionModal.close()">✕
        </button>
        <h3 class="font-bold text-lg mx-auto text-center">Ticket Submission Details</h3>
        <form @submit.prevent="saveSubmission">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Block</span>
            </label>
            <input maxlength="100" v-model="tempSubmission.block" type="text" class="input input-bordered w-full"/>
            <label class="label">
              <span class="label-text-alt">{{tempSubmission.booking_event?.filters}}</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Row</span>
            </label>
            <input maxlength="100" v-model="tempSubmission.row" type="text" class="input input-bordered w-full"/>
            <label class="label">
              <span class="label-text-alt">{{tempSubmission.booking_event?.filters}}</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Seats</span>
            </label>
            <div class="flex gap-1">
              <input type="text" class="input input-bordered w-full grow" maxlength="100" v-model="tempSubmission.seats" />
              <button v-if="tempSubmission.seats != 'Standing'" @click="tempSubmission.seats = 'Standing'" class="btn">Standing</button>
            </div>
            <label class="label">
              <span class="label-text-alt">{{tempSubmission.booking_event?.filters}}</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Quantity</span>
            </label>
            <input v-model="tempSubmission.quantity" type="number" min="1" class="input input-bordered w-full"/>
            <label class="label">
              <span class="label-text-alt">Limit: {{tempSubmission.booking_event?.limits}}</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Face Value per Ticket</span>
            </label>
            <input v-model="tempSubmission.face_value" type="number" step="0.01" min="1" class="input input-bordered w-full"/>
            <label class="label">
              <span class="label-text-alt">Expected price: {{tempSubmission.booking_event?.expected_price}}</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Primary</span>
            </label>
            <input maxlength="100" v-model="tempSubmission.primary_info" type="text" class="input input-bordered w-full"/>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Notes</span>
            </label>
            <input maxlength="100" v-model="tempSubmission.notes" type="text" class="input input-bordered w-full"/>
          </div>
        </form>
        <div class="modal-action">
          <button type="button" v-if="tempSubmission.id" class="btn btn-error" @click="deleteSubmission">Delete</button>
          <button type="button" class="btn btn-success" @click="saveSubmission">Save</button>
        </div>
      </div>
    </dialog>

    <div class="flex gap-2 p-2 flex-col">
      <client-event-row-sm v-for="bookingEvent in bookingEventsStore.sortedEvents" :key="bookingEvent.id" :booking-event="bookingEvent" @open-add-submission="openNewSubmission" @open-edit-submission="openEditSubmission"/>
    </div>
  </page-wrapper>
</template>

