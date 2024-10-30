<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type TicketSubmission from "@/model/TicketSubmission";
import {PurchaseState, SubmissionGeneralStatus, TicketEvaluation} from "@/model/TicketSubmission";
import {useDataStore} from "@/stores/DataStore";
import {WsMessageCode} from "@/model/WsMessage";
import moment from "moment";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useCommentsStore} from "@/stores/CommentsStore";

export default defineComponent({
  name: "ClientSubmissionRowSm",
  props: {
    ticketSubmission: {
      type: Object as PropType<TicketSubmission>,
      required: true
    }
  },
  emits: ['openEditSubmission'],

  data() {
    return {
      expanded: false,
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

    webSocketsStore: () => useWebSocketsStore(),
    commentsStore: () => useCommentsStore(),


    colorClass() {
      switch (this.ticketSubmission.generalStatus) {
        case SubmissionGeneralStatus.Purchased:
          return 'bg-green-500';
        case SubmissionGeneralStatus.Discarded:
          return 'bg-red-500';
        case SubmissionGeneralStatus.Lost:
          return 'bg-red-500';
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

    changePurchaseState(newState: PurchaseState) {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      messageSubmission.purchase_state = newState;
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.EditTicketSubmission,
        content: messageSubmission
      })
    },

    setLastMinute() {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.SetLastMinute,
        content: messageSubmission
      })
    },

    setLastPage() {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      messageSubmission.last_page = true;
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.EditTicketSubmission,
        content: messageSubmission
      })
    },

    deleteSubmission() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.DeleteTicketSubmission,
        content: this.ticketSubmission
      })
    },
  }
})
</script>

<template>
  <tr :class="colorClass + (ticketSubmission.shouldFlash ? ' flash-color-animation' : '')">
    <td @click="expanded = !expanded">{{ ticketSubmission.block }}</td>
    <td @click="expanded = !expanded">{{ ticketSubmission.row }}</td>
    <td @click="expanded = !expanded">{{ ticketSubmission.seats }}</td>
    <td @click="expanded = !expanded">{{ ticketSubmission.quantity }}</td>
    <td @click="expanded = !expanded">{{ ticketSubmission.face_value }}</td>
    <td @click="expanded = !expanded">{{ ticketSubmission.primary_info }}</td>
    <td @click="expanded = !expanded">{{ ticketSubmission.notes }}</td>
    <td>
      <div class="indicator w-full">
        <button class="btn btn-square btn-xs relative" @click="$emit('openEditSubmission', ticketSubmission)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
            <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
          </svg>
        </button>
        <span v-if="ticketSubmission.unreadComments" class="indicator-item badge badge-xs badge-secondary"></span>
      </div>
    </td>
  </tr>
  <tr :class="(expanded ? '' : 'hidden') + ' '">
    <td>
      <template v-if="ticketSubmission.purchase_state == PurchaseState.Pending">
        {{ ticketSubmission.passedTime ?? '' }}
      </template>
    </td>
    <td>
      <span class="font-bold text-red-600" v-if="ticketSubmission.last_minute">{{ ticketSubmission.remainingLastMinute ?? '' }}</span>
      <button v-else class="btn btn-xs btn-warning" @click="setLastMinute">1m</button>
    </td>
    <td>
      <span class="font-bold text-red-600" v-if="ticketSubmission.last_page">LP</span>
      <button v-else class="btn btn-xs btn-warning" @click="setLastPage">LP</button>
    </td>
    <td>
      <div class="indicator">
        <button class="btn btn-xs btn-info" @click="commentsStore.openModal(ticketSubmission)">Comments</button>
        <span v-if="ticketSubmission.unreadComments" class="indicator-item badge badge-xs badge-secondary"></span>
      </div>
    </td>
    <td colspan="4">
      <div v-if="ticketSubmission.purchase_state == PurchaseState.Pending" class="flex gap-1">
        <button v-if="ticketSubmission.evaluation != TicketEvaluation.LowDemand" class="btn btn-xs btn-success flex-grow" @click="changePurchaseState(PurchaseState.Purchased)">Bought</button>
        <button class="btn btn-xs btn-error flex-grow" @click="changePurchaseState(PurchaseState.NotPurchased)">{{ ticketSubmission.evaluation == TicketEvaluation.LowDemand ? 'Discard' : 'Lost' }}</button>

      </div>
    </td>
  </tr>
</template>
