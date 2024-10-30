import type BookingEvent from "@/model/BookingEvent";
import type Comment from "@/model/Comment";

export default interface TicketSubmission {
    id: number;
    booking_event_id: number;
    booking_event: BookingEvent | null;
    block: string;
    row: string;
    seats: string;
    quantity: number;
    face_value: number;
    primary_info: string;
    notes: string;
    evaluation: TicketEvaluation;
    purchase_state: PurchaseState;
    user_code: string;
    moment: Date;
    passedTime: string | null;
    generalStatus: SubmissionGeneralStatus | null;
    last_minute: Date | null,
    last_page: boolean,
    remainingLastMinute: string | null,
    shouldFlash: boolean | null;
    hidden: boolean | null;
    canMassEval: boolean | null;
    comments: Comment[] | null;
    unreadComments?: boolean;
}



export enum TicketEvaluation {
    Pending = 0,
    LowDemand = 1,
    HighDemand = 2,
    Hold = 3
}

export enum PurchaseState {
    Pending = 0,
    NotPurchased = 1,
    Purchased = 2
}

export const EmptySubmission = {
    id: 0,
    booking_event_id: 0,
    block: '',
    row: '',
    seats: '',
    quantity: 0,
    face_value: 0,
    primary_info: '',
    notes: '',
    evaluation: TicketEvaluation.Pending,
    purchase_state: PurchaseState.Pending,
    user_code: '',
    moment: new Date()
} as TicketSubmission

export enum SubmissionGeneralStatus {
    Pending = 1,
    Hold = 2,
    HighDemand = 3,
    LowDemand = 4,
    Purchased = 5,
    Discarded = 6,
    Lost = 7,
}

export function DefaultTicketSubmission(): TicketSubmission {
    return {
        id: 0,
        booking_event_id: 0,
        booking_event: null,
        block: '',
        row: '',
        seats: '',
        quantity: 0,
        face_value: 0,
        primary_info: '',
        notes: '',
        evaluation: TicketEvaluation.Pending,
        purchase_state: PurchaseState.Pending,
        user_code: '',
        moment: new Date(),
        passedTime: null,
        generalStatus: null,
        last_minute: null,
        last_page: false,
        remainingLastMinute: null,
        shouldFlash: null,
        hidden: null,
        canMassEval: null,
        comments: null,
    };
}