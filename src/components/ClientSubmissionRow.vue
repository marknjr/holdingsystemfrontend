<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type TicketSubmission from "@/model/TicketSubmission";
import {PurchaseState, SubmissionGeneralStatus, TicketEvaluation} from "@/model/TicketSubmission";
import {WsMessageCode} from "@/model/WsMessage";
import moment from "moment";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import {useCommentsStore} from "@/stores/CommentsStore";

export default defineComponent({
  name: "ClientSubmissionRow",
  props: {
    ticketSubmission: {
      type: Object as PropType<TicketSubmission>,
      required: true
    }
  },

  data() {
    return {
      isEditing: false,
      tempSubmission: {
        id: 0,
        booking_event_id: this.ticketSubmission.booking_event_id,
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
      } as TicketSubmission,

    }
  },

  computed: {
    TicketEvaluation() {
      return TicketEvaluation
    },
    moment() {
      return moment
    },
    PurchaseState() {
      return PurchaseState
    },

    websocketsStore: () => useWebSocketsStore(),
    ticketSubmissionsStore: () => useTicketSubmissionsStore(),
    commentsStore: () => useCommentsStore(),


    colorClass() {
      switch (this.ticketSubmission.generalStatus) {
        case SubmissionGeneralStatus.Purchased:
          return 'bg-green-500';
        case SubmissionGeneralStatus.Discarded:
          return 'bg-red-500';
        case SubmissionGeneralStatus.Lost:
          return 'bg-orange-500';
        case SubmissionGeneralStatus.HighDemand:
          return 'bg-green-200';
        case SubmissionGeneralStatus.LowDemand:
          return 'bg-red-200';
        case SubmissionGeneralStatus.Hold:
          return 'bg-yellow-200';
        default:
          return '';
      }
    },
  },

  methods: {
    startEdit() {
      Object.assign(this.tempSubmission, this.ticketSubmission);
      this.isEditing = true;
    },

    saveEdit() {
      this.websocketsStore.sendMessage({
        messageCode: WsMessageCode.EditTicketSubmission,
        content: this.tempSubmission
      })
      this.isEditing = false;
    },

    changePurchaseState(newState: PurchaseState) {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      messageSubmission.purchase_state = newState;
      this.websocketsStore.sendMessage({
        messageCode: WsMessageCode.EditTicketSubmission,
        content: messageSubmission
      })
    },

    setLastMinute() {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      this.websocketsStore.sendMessage({
        messageCode: WsMessageCode.SetLastMinute,
        content: messageSubmission
      })
    },

    setLastPage() {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      messageSubmission.last_page = true;
      this.websocketsStore.sendMessage({
        messageCode: WsMessageCode.EditTicketSubmission,
        content: messageSubmission
      })
    },

    deleteSubmission() {
      this.websocketsStore.sendMessage({
        messageCode: WsMessageCode.DeleteTicketSubmission,
        content: this.ticketSubmission
      })
    },
  }
})
</script>

<template>
  <tr :class="colorClass + (ticketSubmission.shouldFlash ? ' flash-color-animation' : '')">
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Waiting Room')"></td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('OnSale Time')"></td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Passed')" class="whitespace-nowrap">
      <template v-if="ticketSubmission.purchase_state == PurchaseState.Pending">
        {{ ticketSubmission.passedTime ?? '' }}
      </template>
    </td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Event')" class="whitespace-nowrap">{{ ticketSubmission.booking_event?.name }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Arena')" class="whitespace-nowrap">{{ ticketSubmission.booking_event?.arena }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Day')" class="whitespace-nowrap">{{ ticketSubmission.booking_event?.day }}</td>
    <td v-if="!ticketSubmissionsStore.hiddenSubmissionColumns.includes('Date')" class="whitespace-nowrap">{{ moment.utc(ticketSubmission.booking_event?.date).format('DD/MM/YYYY')}}</td>
    <template  v-if="!isEditing">
      <td>{{ ticketSubmission.block }}</td>
      <td>{{ ticketSubmission.row }}</td>
      <td>{{ ticketSubmission.seats }}</td>
      <td>{{ ticketSubmission.quantity }}</td>
      <td>{{ ticketSubmission.face_value }}</td>
      <td>{{ ticketSubmission.primary_info }}</td>
      <td>{{ ticketSubmission.notes }}</td>
      <td>
        <div class="indicator">
          <button class="btn btn-xs btn-info" @click="commentsStore.openModal(ticketSubmission)">Comments</button>
          <span v-if="ticketSubmission.unreadComments" class="indicator-item badge badge-xs badge-secondary"></span>
        </div>
      </td>
      <td class="whitespace-nowrap">
        <span class="font-bold text-red-600" v-if="ticketSubmission.last_minute">{{ ticketSubmission.remainingLastMinute ?? '' }}</span>
        <button v-else class="btn btn-xs btn-warning" @click="setLastMinute">1m</button>
      </td>
      <td class="whitespace-nowrap">
        <span class="font-bold text-red-600" v-if="ticketSubmission.last_page">LP</span>
        <button v-else class="btn btn-xs btn-warning" @click="setLastPage">LP</button>
      </td>
      <td>
        <div v-if="ticketSubmission.purchase_state == PurchaseState.Pending" class="whitespace-nowrap flex flex-row gap-1">
          <button v-if="ticketSubmission.evaluation != TicketEvaluation.LowDemand" class="btn btn-xs btn-success flex-grow" @click="changePurchaseState(PurchaseState.Purchased)">Bought</button>


          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-xs btn-error flex-grow">{{ ticketSubmission.evaluation == TicketEvaluation.LowDemand ? 'Discard' : 'Lost' }}</label>
            <div class="dropdown-content bg-white p-4 rounded-box shadow z-[1]">
              <p style="font-size: 1rem">Are you sure you want to discard this submission?</p>
              <button class="btn btn-error btn-xs mt-3" @click="changePurchaseState(PurchaseState.NotPurchased)">Confirm</button>
            </div>
          </div>

          <button class="btn btn-xs btn-warning flex-grow" @click="startEdit()">Edit</button>
        </div>
      </td>
    </template>
    <template v-if="isEditing">
      <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.block" /></td>
      <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.row" /></td>
      <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.seats" /></td>
      <td><input type="number" step="1" min="1" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.quantity" /></td>
      <td><input type="number" step="0.01" min="1" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.face_value" /></td>
      <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.primary_info" /></td>
      <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempSubmission.notes" /></td>
      <td></td>
      <td></td>
      <td></td>
      <td>
        <div v-if="ticketSubmission.purchase_state == PurchaseState.Pending" class="whitespace-nowrap flex flex-row gap-1">
          <button class="btn btn-xs btn-success flex-grow" @click="saveEdit">Save</button>
          <button class="btn btn-xs btn-error flex-grow" @click="deleteSubmission">Delete</button>
        </div>
      </td>
    </template>
  </tr>
</template>
