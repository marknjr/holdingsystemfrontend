import {defineStore} from "pinia";
import type TicketSubmission from "@/model/TicketSubmission";
import eventBus from "@/EventBus.js";
import {PurchaseState, SubmissionGeneralStatus, TicketEvaluation} from "@/model/TicketSubmission";
import type BookingEvent from "@/model/BookingEvent";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import {UserType} from "@/model/UserType";
import {WsMessageCode} from "@/model/WsMessage";
import router from "@/router";
import {useSoundStore} from "@/stores/SoundStore";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export const useTicketSubmissionsStore = defineStore('ticketSubmissions', {
    state: () => {
        return {
            ticketSubmissions: [] as TicketSubmission[],
            submissionsDictionary: {} as {[key: number]: TicketSubmission},
            hideLost: false,
            hideBought: false,
            hiddenEventIds: [] as number[],
            counterFlashing: false,
            hiddenSubmissionColumns: [] as string[],
        }
    },
    getters: {
        bookingEventsStore: state => useBookingEventsStore(),
        soundStore: state => useSoundStore(),
        authenticationStore: (state) => useAuthenticationStore(),
        webSocketsStore: state => useWebSocketsStore(),
    },
    actions: {
        setup() {
            eventBus.on('bookingEventDeleted', (bookingEvent) => {
                for(const submission of bookingEvent.ticket_submissions) {
                    this.ticketSubmissions.splice(this.ticketSubmissions.indexOf(submission), 1);
                    delete this.submissionsDictionary[submission.id];
                }
                bookingEvent.ticket_submissions = [];
            });
            eventBus.on('wsMessage', (message) => {
                switch (message.messageCode) {
                    case WsMessageCode.AddTicketSubmission:
                        this.addTicketSubmission(message.content)
                        break;
                    case WsMessageCode.EditTicketSubmission:
                        this.editTicketSubmission(message.content)
                        break;
                    case WsMessageCode.DeleteTicketSubmission:
                        this.deleteTicketSubmission(message.content)
                        break;
                }
            });
        },
        initData(initialSubmissions: TicketSubmission[]) {
            this.ticketSubmissions = initialSubmissions;
            this.submissionsDictionary = {};

            for(const submission of this.ticketSubmissions) {
                if(this.bookingEventsStore.eventsDictionary[submission.booking_event_id] === undefined)
                    continue;
                this.setGeneralStatus(submission);
                this.submissionsDictionary[submission.id] = submission;
                const event = this.bookingEventsStore.eventsDictionary[submission.booking_event_id] as BookingEvent;
                event.ticket_submissions.push(submission);
                submission.booking_event = event;
                submission.canMassEval = true;
            }
        },

        hideSubmissionColumn(column: string) {
            this.hiddenSubmissionColumns.push(column);
        },

        showSubmissionColumn(column: string) {
            this.hiddenSubmissionColumns.splice(this.hiddenSubmissionColumns.indexOf(column), 1);
        },

        sortSubmissions(column: string, reverse = false) {
            this.ticketSubmissions.sort((a: TicketSubmission, b: TicketSubmission) => {
                if(a.purchase_state == PurchaseState.Pending && b.purchase_state != PurchaseState.Pending)
                    return -1;
                if(a.purchase_state != PurchaseState.Pending && b.purchase_state == PurchaseState.Pending)
                    return 1;
                let r = 0;
                let val1 = null;
                let val2 = null;
                if(column == 'event') {
                    val1 = a.booking_event?.name;
                    val2 = b.booking_event?.name;
                }
                else if(column == 'arena') {
                    val1 = a.booking_event?.arena;
                    val2 = b.booking_event?.arena;
                }else if(column == 'day') {
                    val1 = a.booking_event?.day;
                    val2 = b.booking_event?.day;
                }
                else if(column == 'date') {
                    val1 = a.booking_event?.date;
                    val2 = b.booking_event?.date;
                }
                else {
                    val1 = (a as any)[column];
                    val2 = (b as any)[column];
                }
                if(val1 > val2 || val2 == null)
                    r = 1;
                else if(val2 > val1 || val1 == null)
                    r = -1;
                if(reverse)
                    r *= -1;
                return r;
            });
        },

        sortSubmissionsCustom(sortFunction: (a: TicketSubmission, b: TicketSubmission) => number) {
            this.ticketSubmissions.sort(sortFunction);
        },

        setGeneralStatus(submission: TicketSubmission) {
            if(submission.purchase_state == PurchaseState.Purchased)
                submission.generalStatus = SubmissionGeneralStatus.Purchased;
            else if(submission.purchase_state == PurchaseState.NotPurchased) {
                if(submission.evaluation == TicketEvaluation.LowDemand)
                    submission.generalStatus = SubmissionGeneralStatus.Discarded;
                else submission.generalStatus = SubmissionGeneralStatus.Lost;
            }
            else if(submission.evaluation == TicketEvaluation.HighDemand)
                submission.generalStatus = SubmissionGeneralStatus.HighDemand;
            else if(submission.evaluation == TicketEvaluation.LowDemand)
                submission.generalStatus = SubmissionGeneralStatus.LowDemand;
            else if(submission.evaluation == TicketEvaluation.Hold)
                submission.generalStatus = SubmissionGeneralStatus.Hold;
            else
                submission.generalStatus = SubmissionGeneralStatus.Pending;
        },

        addTicketSubmission(ticketSubmission: TicketSubmission) {
            this.setGeneralStatus(ticketSubmission);
            const event = this.bookingEventsStore.eventsDictionary[ticketSubmission.booking_event_id] as BookingEvent;
            ticketSubmission.booking_event = event;
            this.ticketSubmissions.push(ticketSubmission);
            this.submissionsDictionary[ticketSubmission.id] = ticketSubmission;
            event.ticket_submissions.push(ticketSubmission);
            ticketSubmission.canMassEval = false;
            setTimeout(() => {
                ticketSubmission.canMassEval = true;
            }, 2500)

            if(this.authenticationStore.userType == UserType.Client) {
                const timeoutSubmission = Object.assign({}, ticketSubmission);
                setTimeout(() => {
                    if(!this.submissionsDictionary[timeoutSubmission.id])
                        return;
                    this.webSocketsStore.sendMessage({
                        messageCode: WsMessageCode.SubmissionHold,
                        content: timeoutSubmission
                    })
                }, 30000);
            }
            else {
                this.soundStore.neutralSound.play();
                this.flashCounter();
                if(router.currentRoute.value.name != 'submissions' || !document.hasFocus()) {
                    if (("Notification" in window) && Notification.permission === "granted") {
                        new Notification("A new submission has been added");
                    }
                }
            }
        },

        editTicketSubmission(ticketSubmission: TicketSubmission) {
            this.setGeneralStatus(ticketSubmission);
            const submissionId = ticketSubmission.id;
            const oldSubmission = this.submissionsDictionary[submissionId] as TicketSubmission;


            const changedEvaluation = oldSubmission.evaluation != ticketSubmission.evaluation;
            const changedPurchaseState = oldSubmission.purchase_state != ticketSubmission.purchase_state;
            const isAdmin = this.authenticationStore.userType == UserType.Admin;

            oldSubmission.canMassEval = false;
            setTimeout(() => {
                oldSubmission.canMassEval = true;
            }, 2500)

            if(isAdmin && changedPurchaseState) {
                switch (ticketSubmission.purchase_state) {
                    case PurchaseState.Purchased:
                        this.soundStore.positiveSound.play();
                        break;
                    case PurchaseState.NotPurchased:
                        this.soundStore.negativeSound.play();
                        break;
                }
                this.flashSubmission(ticketSubmission, 1000);
            }

            if(!isAdmin && changedEvaluation) {
                switch (ticketSubmission.evaluation) {
                    case TicketEvaluation.HighDemand:
                        this.soundStore.positiveSound.play();
                        break;
                    case TicketEvaluation.LowDemand:
                        this.soundStore.negativeSound.play();
                        break;
                    case TicketEvaluation.Hold:
                        this.soundStore.neutralSound.play();
                        break;
                }
                let flashDuration = 1000;
                if([TicketEvaluation.LowDemand, TicketEvaluation.HighDemand].includes(oldSubmission.evaluation))
                    if([TicketEvaluation.LowDemand, TicketEvaluation.HighDemand].includes(ticketSubmission.evaluation))
                        flashDuration = 2500;
                this.flashSubmission(ticketSubmission, flashDuration);
            }
            Object.assign(this.submissionsDictionary[submissionId], ticketSubmission);
        },

        flashSubmission(submission: TicketSubmission, duration: number) {
            submission.shouldFlash = true;
            setTimeout(() => {
                this.submissionsDictionary[submission.id].shouldFlash = false;
            }, duration);

            if((this.authenticationStore.userType == UserType.Admin && router.currentRoute.value.name != 'submissions') || !document.hasFocus()) {
                if (("Notification" in window) && Notification.permission === "granted") {
                    new Notification("A submission has been changed");
                }
            }
        },

        deleteTicketSubmission(ticketSubmission: TicketSubmission) {
            const realSubmission = this.submissionsDictionary[ticketSubmission.id] as TicketSubmission;
            const event = this.bookingEventsStore.eventsDictionary[ticketSubmission.booking_event_id] as BookingEvent;
            this.ticketSubmissions.splice(this.ticketSubmissions.indexOf(realSubmission), 1);
            event.ticket_submissions.splice(event.ticket_submissions.indexOf(realSubmission), 1);
            delete this.submissionsDictionary[ticketSubmission.id];
        },


        hideEvent(eventId: number) {
            this.hiddenEventIds.push(eventId);
            for(const submission of this.ticketSubmissions) {
                if(submission.booking_event_id == eventId)
                    submission.hidden = true;
            }
        },

        unhideEvent(eventId: number) {
            this.hiddenEventIds.splice(this.hiddenEventIds.indexOf(eventId), 1)
            for(const submission of this.ticketSubmissions) {
                if(submission.booking_event_id == eventId)
                    submission.hidden = false;
            }
        },

        flashCounter() {
            this.counterFlashing = true;
            setTimeout(() => {
                this.counterFlashing = false;
            }, 1000);
        },
    }
});