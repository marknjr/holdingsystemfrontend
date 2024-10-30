import {defineStore} from "pinia";
import {useDataStore} from "@/stores/DataStore";
import {PurchaseState, SubmissionGeneralStatus, TicketEvaluation} from "@/model/TicketSubmission";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";

export const useSummaryStore = defineStore('summary', {
    state: () => {
        return {
            showSummary: false,
        }
    },
    getters: {
        bookingEventsStore: (state) => useBookingEventsStore(),
        ticketSubmissionsStore: () => useTicketSubmissionsStore(),
        purchaseCounters() {
            const counters = {} as any;
            for (const event of this.bookingEventsStore.bookingEvents)
                counters[event.id] = {quantity: 0, predictedValue: 0};
            for (const submission of this.ticketSubmissionsStore.ticketSubmissions)
                if(submission.generalStatus && [SubmissionGeneralStatus.Purchased, SubmissionGeneralStatus.HighDemand].includes(submission.generalStatus)) {
                    counters[submission.booking_event_id].quantity += submission.quantity;
                    counters[submission.booking_event_id].predictedValue += submission.quantity * submission.face_value;
                }
            return counters;
        },

        lostCounters() {
            const counters = {} as any;
            for (const event of this.bookingEventsStore.bookingEvents)
                counters[event.id] = {quantity: 0, predictedValue: 0};
            for (const submission of this.ticketSubmissionsStore.ticketSubmissions)
                if(submission.generalStatus == SubmissionGeneralStatus.Lost) {
                    counters[submission.booking_event_id].quantity += submission.quantity;
                    counters[submission.booking_event_id].predictedValue += submission.quantity * submission.face_value;
                }
            return counters as any;
        },
        pendingCounters() {
            const counters = {} as any;
            for (const event of this.bookingEventsStore.bookingEvents)
                counters[event.id] = {quantity: 0, predictedValue: 0};
            for (const submission of this.ticketSubmissionsStore.ticketSubmissions)
                if(!submission.generalStatus || [SubmissionGeneralStatus.Hold, SubmissionGeneralStatus.Pending].includes(submission.generalStatus)) {
                    counters[submission.booking_event_id].quantity += submission.quantity;
                    counters[submission.booking_event_id].predictedValue += submission.quantity * submission.face_value;
                }
            return counters as any;
        },
        predictedCostTotals() {
            let bought = 0;
            let pending = 0;
            let lost = 0;

            for(const key in this.purchaseCounters)
                bought += this.purchaseCounters[key].predictedValue;
            for(const key in this.pendingCounters)
                pending += this.pendingCounters[key].predictedValue;
            for(const key in this.lostCounters)
                lost += this.lostCounters[key].predictedValue;

            return { bought, pending, lost};
        },
    },
    actions: {
    }
});