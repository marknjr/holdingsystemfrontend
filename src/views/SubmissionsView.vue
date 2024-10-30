<template>
  <page-wrapper>
    <!-- Add error toast/notification container if not handled globally -->
    <div v-if="quantityError" class="alert alert-error fixed top-4 right-4 z-50 fade-out">
      {{ quantityError }}
    </div>

    <table class="table table-xs z-0" ref="resizableTable"  data-rtc-resizable-table="table.one">
      <thead class="table-md bg-base-100 sticky top-0 z-[1]">
      <tr>
        <th class="cursor-pointer" @click="sortTable('user_code')">User Code</th>
        <th class="cursor-pointer on-sale-time-column">On-Sale Time</th>
        <th class="cursor-pointer" @click="sortTable('moment')">Time</th>
        <th class="cursor-pointer" @click="sortTable('moment')">Passed</th>
        <th class="cursor-pointer" @click="sortTable('event')">Name</th>
        <th class="cursor-pointer" @click="sortTable('arena')">Arena</th>
        <th class="cursor-pointer" @click="sortTable('day')">Day</th>
        <th class="cursor-pointer" @click="sortTable('date')">Date</th>
        <th class="cursor-pointer" @click="sortTable('block')">Block</th>
        <th class="cursor-pointer" @click="sortTable('row')">Row</th>
        <th class="cursor-pointer" @click="sortTable('seats')">Seats</th>
        <th class="cursor-pointer" @click="sortTable('quantity')">Quantity</th>
        <th class="cursor-pointer" @click="sortTable('face_value')">Face Value</th>
        <th class="cursor-pointer" @click="sortTable('generalStatus')">Status</th>
        <th class="cursor-pointer" @click="sortTable('primary')">Primary</th>
        <th class="cursor-pointer notes-column" @click="sortTable('notes')">Notes</th>
        <th class="cursor-pointer" @click="sortTable('last_minute')">1m</th>
        <th class="cursor-pointer" @click="sortTable('last_page')">LP</th>
        <th>Comments</th>
        <th>
          <div class="whitespace-nowrap flex flex-row gap-1">
            <button class="btn btn-xs btn-success flex-grow" @click="evaluateAll(TicketEvaluation.HighDemand)">ALL HD</button>
            <button class="btn btn-xs btn-error flex-grow" @click="evaluateAll(TicketEvaluation.LowDemand)">All LD</button>
          </div>
        </th>
      </tr>

      <tr class="bg-blue-300">
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterUserCode" /></td>
        <td></td>
        <td></td>
        <td></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterName" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterArena" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterDay" /></td>
        <td></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterBlock" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterRow" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterSeats" /></td>
        <td>
          <input 
            type="number" 
            class="input input-bordered input-xs w-full max-w-xs" 
            v-model="filterQuantity"
            min="0"
            max="14"
            @input="validateQuantity"
          />
        </td>
        <td><input type="number" class="input input-bordered input-xs w-full max-w-xs" v-model="filterFaceValue" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterStatus" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterPrimary" /></td>
        <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterNotes" /></td>
        <td></td>
        <td></td>
        <td></td>
        <td><button class="btn btn-xs btn-link" @click="clearFilters()">Clear Filters</button></td>
      </tr>
      </thead>
      <tbody>
      <admin-submission-row v-for="ticketSubmission in visibleSubmissions" :key="ticketSubmission.id" :ticket-submission="ticketSubmission"/>
      </tbody>
    </table>
  </page-wrapper>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import PageWrapper from "@/components/PageWrapper.vue";
import type TicketSubmission from "@/model/TicketSubmission";
import {PurchaseState, SubmissionGeneralStatus, TicketEvaluation} from "@/model/TicketSubmission";
import {useDataStore} from "@/stores/DataStore";
import AdminSubmissionRow from "@/components/AdminSubmissionRow.vue";
import {WsMessageCode} from "@/model/WsMessage";
import {ResizableTableColumns} from "@validide/resizable-table-columns";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { NotificationType } from "@/model/UserNotification";

export default defineComponent({
  name: "SubmissionsView",
  components: {AdminSubmissionRow, PageWrapper},

  mounted() {
    new ResizableTableColumns(this.$refs.resizableTable as HTMLTableElement, null);
    console.log("resizabil");
  },

  computed: {
    TicketEvaluation() {
      return TicketEvaluation
    },

    webSocketsStore: () => useWebSocketsStore(),
    ticketSubmissionsStore: () => useTicketSubmissionsStore(),
    notificationStore: () => useNotificationStore(),

    visibleSubmissions(): TicketSubmission[] {
      return this.ticketSubmissionsStore.ticketSubmissions.filter((submission) => {
        if(submission.hidden)
          return false;
        if(this.ticketSubmissionsStore.hideLost && (submission.purchase_state == PurchaseState.NotPurchased || submission.evaluation == TicketEvaluation.LowDemand))
          return false;
        if(this.ticketSubmissionsStore.hideBought && submission.purchase_state == PurchaseState.Purchased)
          return false;

        if(this.filterUserCode && !submission.user_code.toLowerCase().includes(this.filterUserCode.toLowerCase()))
          return false;

        if(this.filterName && !submission.booking_event?.name.toLowerCase().includes(this.filterName.toLowerCase()))
          return false;

        if(this.filterArena && !submission.booking_event?.arena.toLowerCase().includes(this.filterArena.toLowerCase()))
          return false;

        if(this.filterDay && !submission.booking_event?.day.toLowerCase().includes(this.filterDay.toLowerCase()))
          return false;

        if(this.filterBlock && !submission.block.toLowerCase().includes(this.filterBlock.toLowerCase()))
          return false;

        if(this.filterRow && !submission.row.toLowerCase().includes(this.filterRow.toLowerCase()))
          return false;

        if(this.filterSeats && !submission.seats.toLowerCase().includes(this.filterSeats.toLowerCase()))
          return false;

        if(this.filterQuantity && submission.quantity != this.filterQuantity)
          return false;

        if(this.filterFaceValue && submission.face_value != this.filterFaceValue)
          return false;

        if(this.filterStatus && !this.generalStatusString(submission).toLowerCase().includes(this.filterStatus.toLowerCase()))
          return false;

        if(this.filterPrimary && !submission.primary_info.toLowerCase().includes(this.filterPrimary.toLowerCase()))
          return false;

        if(this.filterNotes && !submission.notes.toLowerCase().includes(this.filterNotes.toLowerCase()))
          return false;

        return true;
      })
    }
  },

  data() {
    return {
      sortColumn: '',
      sortReverse: false,
      quantityError: '',
      filterUserCode: '',
      filterName: '',
      filterArena: '',
      filterDay: '',
      filterBlock: '',
      filterRow: '',
      filterSeats: '',
      filterQuantity: 0,
      filterFaceValue: 0,
      filterStatus: '',
      filterPrimary: '',
      filterNotes: '',
    }
  },

  methods: {
    validateQuantity(event: Event) {
      const input = event.target as HTMLInputElement;
      let value = parseInt(input.value);
      
      if (value > 14) {
        this.filterQuantity = 14;
        this.notificationStore.add(NotificationType.Error, 'Maximum quantity allowed is 14 tickets');
      } else if (value < 0) {
        this.filterQuantity = 0;
      }
    },

    clearFilters() {
      this.filterUserCode = '';
      this.filterName = '';
      this.filterArena = '';
      this.filterDay = '';
      this.filterBlock = '';
      this.filterRow = '';
      this.filterSeats = '';
      this.filterQuantity = 0;
      this.filterFaceValue = 0;
      this.filterStatus = '';
      this.filterPrimary = '';
      this.filterNotes = '';
    },

    evaluateAll(evaluation: TicketEvaluation) {
      for(const submission of this.visibleSubmissions) {
        if(!submission.canMassEval)
          continue;
        if(submission.evaluation != TicketEvaluation.Pending)
          continue;
        if(submission.purchase_state != PurchaseState.Pending)
          continue;

        let messageSubmission = Object.assign({}, submission);
        messageSubmission.evaluation = evaluation;
        this.webSocketsStore.sendMessage({
          messageCode: WsMessageCode.EditTicketSubmission,
          content: messageSubmission
        })
      }
    },

    sortTable(column: string){
      if(column == this.sortColumn)
        this.sortReverse = !this.sortReverse;
      else {
        this.sortColumn = column;
        this.sortReverse = false;
      }
      this.ticketSubmissionsStore.sortSubmissions(this.sortColumn, this.sortReverse);
    },

    generalStatusString(submission: TicketSubmission) {
      switch (submission.generalStatus) {
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
  }
})
</script>

<style scoped>
.fade-out {
  animation: fadeOut 3s;
  animation-fill-mode: forwards;
  
}
.notes-column {
  width: 90px; /* Adjust this value as needed */
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.on-sale-time-column {
  width: 40px; /* Adjust as needed */
  max-width: 40px;
  text-align: center; /* Optional: center the text */
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; display: none; }
}
</style>