import {defineStore} from 'pinia'
import {WsMessageCode} from "@/model/WsMessage";
import axios from "axios";
import {useNotificationStore} from "@/stores/NotificationStore";
import {NotificationType} from "@/model/UserNotification";
import {useUserTipsStore} from "@/stores/UserTipsStore";
import eventBus from "@/EventBus.js";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import {useLinksStore} from "@/stores/LinksStore";

export const useDataStore = defineStore('data', {
    state: () => {
        return {
            connectedUsersCount: 0,
            usersPendingTermsCount: 0,
        }
    },
    getters: {
        notificationStore: (state) => useNotificationStore(),
        userTipsStore: (state) => useUserTipsStore(),
        bookingEventsStore: state => useBookingEventsStore(),
        webSocketsStore: state => useWebSocketsStore(),
        ticketSubmissionsStore: state => useTicketSubmissionsStore(),
        linksStore: state => useLinksStore()
    },
    actions: {
        setup() {
            eventBus.on('wsMessage', (message) => {
                switch (message.messageCode) {
                    case WsMessageCode.ResetApp:
                        this.resetApp()
                        break;
                    case WsMessageCode.UserCounters:
                        this.updateUsersCounters(message.content)
                        break;
                }
            })
        },
        async initData() {
            try {
                const response = await axios.get('/users/load-data');
                if(!response || response.status != 200) {
                    this.notificationStore.add(NotificationType.Error, 'Could not load the initial data');
                    return;
                }
                this.webSocketsStore.initData(response.data.wsUrl);
                this.userTipsStore.initData(response.data.userTips);
                this.bookingEventsStore.initData(response.data.bookingEvents);
                this.ticketSubmissionsStore.initData(response.data.ticketSubmissions);
                this.linksStore.initData(response.data.linkSets);

            }
            catch (e) {
                this.notificationStore.add(NotificationType.Error, e as string);
            }
        },


        updateUsersCounters(counters: any) {
            this.connectedUsersCount = counters.connected;
            this.usersPendingTermsCount = counters.pendingTerms;
        },

        resetApp() {
            this.initData();
        }
    },
})