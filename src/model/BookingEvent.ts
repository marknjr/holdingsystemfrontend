import type TicketSubmission from "@/model/TicketSubmission";
import type Link from "@/model/Link";

export default interface BookingEvent {
    id: number;
    priority: number;
    name: string;
    arena: string;
    day: string;
    date: string;
    filters: string;
    expected_price: string;
    limits: string;
    onsale_time: string | null;
    waiting_room: string | null;
    password: string | null;
    paused: boolean;

    ticket_submissions: TicketSubmission[];
    links: Link[];

    canAddSubmissions: boolean
}

export const EmptyBookingEvent = {
    id: 0,
    priority: 0,
    name: '',
    arena: '',
    day: '',
    date: '',
    filters: '',
    expected_price: '',
    limits: '',
    onsale_time: null,
    waiting_room: null,
    password: null,
    paused: false,
} as BookingEvent