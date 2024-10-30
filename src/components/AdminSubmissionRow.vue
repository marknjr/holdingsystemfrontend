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
  name: "AdminSubmissionRow",
  props: {
    ticketSubmission: {
      type: Object as PropType<TicketSubmission>,
      required: true
    }
  },

  data() {
    return {
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
    moment() {
      return moment
    },

    TicketEvaluation() {
      return TicketEvaluation
    },

    PurchaseState() {
      return PurchaseState
    },

    webSocketsStore: () => useWebSocketsStore(),
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

    generalStatusString() {
      switch (this.ticketSubmission.generalStatus) {
        case SubmissionGeneralStatus.Purchased:
          return 'Bought';
        case SubmissionGeneralStatus.Discarded:
          return 'Discarded';
        case SubmissionGeneralStatus.Lost:
          return 'Lost';
        case SubmissionGeneralStatus.HighDemand:
          return 'HD';
        case SubmissionGeneralStatus.LowDemand:
          return 'LD';
        case SubmissionGeneralStatus.Hold:
          return 'HOLD';
        default:
          return '';
      }
    },
  },

  methods: {
    changeEvaluation(evaluation: TicketEvaluation) {
      let messageSubmission = Object.assign({}, this.ticketSubmission);
      messageSubmission.evaluation = evaluation;
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.EditTicketSubmission,
        content: messageSubmission
      })
    },
  }
})
</script>

<template>
  <tr :class="colorClass + (ticketSubmission.shouldFlash ? ' flash-color-animation' : '')">
    <td class="whitespace-nowrap">{{ ticketSubmission.user_code }}</td>
    <td class="whitespace-nowrap">{{ ticketSubmission.booking_event?.onsale_time ? moment.utc(ticketSubmission.booking_event?.onsale_time).format('HH:mm') : '' }}</td>
    <td class="whitespace-nowrap">{{ moment.utc(ticketSubmission.moment).format('HH:mm:ss') }}</td>
    <td class="whitespace-nowrap">
      <template v-if="ticketSubmission.purchase_state == PurchaseState.Pending">
        {{ ticketSubmission.passedTime ?? '' }}
      </template>
    </td>
    <td class="whitespace-nowrap">
      {{ ticketSubmission.booking_event?.name }}
      <button class="btn btn-link " style="min-height: unset; height: unset; padding: unset; display: inline" @click="ticketSubmissionsStore.hideEvent(ticketSubmission.booking_event_id)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" style="display: unset">
          <path fill-rule="evenodd"
                d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l10.5 10.5a.75.75 0 1 0 1.06-1.06l-1.322-1.323a7.012 7.012 0 0 0 2.16-3.11.87.87 0 0 0 0-.567A7.003 7.003 0 0 0 4.82 3.76l-1.54-1.54Zm3.196 3.195 1.135 1.136A1.502 1.502 0 0 1 9.45 8.389l1.136 1.135a3 3 0 0 0-4.109-4.109Z"
                clip-rule="evenodd"/>
          <path
              d="m7.812 10.994 1.816 1.816A7.003 7.003 0 0 1 1.38 8.28a.87.87 0 0 1 0-.566 6.985 6.985 0 0 1 1.113-2.039l2.513 2.513a3 3 0 0 0 2.806 2.806Z"/>
        </svg>
      </button>

    </td>
    <td class="whitespace-nowrap">{{ ticketSubmission.booking_event?.arena }}</td>
    <td class="whitespace-nowrap">{{ ticketSubmission.booking_event?.day }}</td>
    <td class="whitespace-nowrap">{{ moment.utc(ticketSubmission.booking_event?.date).format('DD/MM/YYYY') }}</td>
    <td>{{ ticketSubmission.block }}</td>
    <td>{{ ticketSubmission.row }}</td>
    <td>{{ ticketSubmission.seats }}</td>
    <td>{{ ticketSubmission.quantity }}</td>
    <td>{{ ticketSubmission.face_value }}</td>
    <td class="whitespace-nowrap">{{ generalStatusString }}</td>
    <td class="whitespace-nowrap">{{ ticketSubmission.primary_info }}</td>
    <td class="whitespace-nowrap">{{ ticketSubmission.notes }}</td>
    <td class="whitespace-nowrap">
      <span class="font-bold text-red-600"
            v-if="ticketSubmission.last_minute">{{ ticketSubmission.remainingLastMinute ?? '' }}</span>
    </td>
    <td class="whitespace-nowrap">
      <span class="font-bold text-red-600" v-if="ticketSubmission.last_page">LP</span>
    </td>
    <td>
      <div class="indicator">
        <button class="btn btn-xs btn-info" @click="commentsStore.openModal(ticketSubmission)">Comments</button>
        <span v-if="ticketSubmission.unreadComments" class="indicator-item badge badge-xs badge-secondary"></span>
      </div>
    </td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <template v-if="ticketSubmission.purchase_state == PurchaseState.Pending">
          <button class="btn btn-xs btn-success flex-grow" @click="changeEvaluation(TicketEvaluation.HighDemand)">HD
          </button>
          <button class="btn btn-xs btn-warning flex-grow" @click="changeEvaluation(TicketEvaluation.Hold)">HOLD
          </button>
          <button class="btn btn-xs btn-error flex-grow" @click="changeEvaluation(TicketEvaluation.LowDemand)">LD
          </button>
        </template>
      </div>
    </td>
  </tr>
</template>
