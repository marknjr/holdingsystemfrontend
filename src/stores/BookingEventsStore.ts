import {defineStore} from "pinia";
import type BookingEvent from "@/model/BookingEvent";
import type SortingData from "@/model/SortingData";
import {UserType} from "@/model/UserType";
import {WsMessageCode} from "@/model/WsMessage";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import eventBus from "@/EventBus.js";

export const useBookingEventsStore = defineStore('bookingEvents', {
    state: () => {
        return {
            bookingEvents: [] as BookingEvent[],
            eventsDictionary: {} as {[key: number]: BookingEvent},
            unenteredEvents: [] as BookingEvent[],
        }
    },
    getters: {
        sortedEvents: (state) => state.bookingEvents.sort((a,b) => a.priority - b.priority),
        webSocketsStore: state => useWebSocketsStore(),
        authenticationStore: (state) => useAuthenticationStore(),
    },
    actions: {
        setup() {
            eventBus.on('wsOpen', () => {
                this.checkUnenteredEvents();
            });
            eventBus.on('wsMessage', (message) => {
                switch (message.messageCode) {
                    case WsMessageCode.AddBookingEvent:
                        this.addBookingEvent(message.content)
                        break;
                    case WsMessageCode.EditBookingEvent:
                        this.editBookingEvent(message.content)
                        break;
                    case WsMessageCode.DeleteBookingEvent:
                        this.deleteBookingEvent(message.content)
                        break;
                    case WsMessageCode.SortBookingEvents:
                        this.sortBookingEvents(message.content)
                        break;
                    case WsMessageCode.UnlockEvent:
                        this.unlockEvents(message.content)
                        break;
                    case WsMessageCode.ListUnenteredEvents:
                        this.listUnenteredEvents(message.content)
                        break;
                }
            })
        },
        initData(initialEvents: BookingEvent[]) {
            this.bookingEvents = initialEvents;
            this.eventsDictionary = {};
            for(const event of this.bookingEvents)
                this.eventsDictionary[event.id] = event;

        },

        addBookingEvent(bookingEvent: BookingEvent, checkUnentered: boolean = true) {
            bookingEvent.ticket_submissions = [];
            this.bookingEvents.push(bookingEvent);
            this.eventsDictionary[bookingEvent.id] = bookingEvent;
            if(checkUnentered)
                this.checkUnenteredEvents();
        },

        editBookingEvent(bookingEvent: BookingEvent) {
            Object.assign(this.eventsDictionary[bookingEvent.id], bookingEvent);
            this.checkUnenteredEvents();
        },

        deleteBookingEvent(bookingEvent: BookingEvent) {
            const realEvent = this.eventsDictionary[bookingEvent.id] as BookingEvent;
            this.bookingEvents.splice(this.bookingEvents.indexOf(realEvent), 1);

            eventBus.emit('bookingEventDeleted', realEvent)
            delete this.eventsDictionary[bookingEvent.id];

            this.checkUnenteredEvents();
        },


        sortBookingEvents(sortingData: SortingData) {
            for(const bookingEvent of this.bookingEvents)
                if(bookingEvent.priority >= sortingData.index)
                    bookingEvent.priority++;
            (this.eventsDictionary[sortingData.id] as BookingEvent).priority = sortingData.index;
        },


        checkUnenteredEvents() {
            if(!this.webSocketsStore.wsIsOpen)
                return;
            if(!this.authenticationStore.loggedIn)
                return;
            if(this.authenticationStore.userType != UserType.Client)
                return;
            this.webSocketsStore.sendMessage({messageCode: WsMessageCode.ListUnenteredEvents, content: {}});
        },

        unlockEvents(events: BookingEvent[]) {
            // for(const event of events) {
            //     this.addBookingEvent(event, false);
            // }
            // this.checkUnenteredEvents();
            window.location.reload();
        },

        listUnenteredEvents(eventIds: number[]) {
            const currentTime = new Date();
            this.unenteredEvents = [];
            for(const eventId of eventIds) {
                const event = this.eventsDictionary[eventId];
                if(!event)
                    continue;
                this.unenteredEvents.push(event);
            }
        },
    }
});