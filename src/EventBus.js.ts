import mitt from 'mitt';
import type WsMessage from "@/model/WsMessage";
import type BookingEvent from "@/model/BookingEvent";

type Events = {
    wsOpen: void,
    wsClose: void,
    wsMessage: WsMessage;
    bookingEventDeleted: BookingEvent,
    loggedInChanged: boolean,
    commentModalOpened: void,
}
const eventBus = mitt<Events>();

export default eventBus;