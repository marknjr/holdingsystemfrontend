import {defineStore} from "pinia";
import type SortingData from "@/model/SortingData";
import type UserTip from "@/model/UserTip";
import type WsMessage from "@/model/WsMessage";
import {UserType} from "@/model/UserType";
import {WsMessageCode} from "@/model/WsMessage";
import eventBus from "@/EventBus.js";
import {NotificationType} from "@/model/UserNotification";
import {useNotificationStore} from "@/stores/NotificationStore";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";

export const useWebSocketsStore = defineStore('webSockets', {
    state: () => {
        return {
            ws: null as (null | WebSocket),
            errorOnClosedWs: true,
            wsIsOpen: false,
            initDataCount: 0,
        }
    },
    getters: {
        notificationStore: state => useNotificationStore(),
        authenticationStore: state => useAuthenticationStore()
    },
    actions: {
        setup() {

        },
        sendMessage(message: WsMessage) {
            const messageJson = JSON.stringify(message, (key, value) => {
                if(key !== "" && key !== "content" && typeof value === 'object' && value !== null) {
                    return undefined;
                }
                return value;
            });
            this.ws?.send(messageJson);
        },

        initData(wsUrl: string) {
            try {
                this.initDataCount++;

                this.closeWS();
                this.ws = new  WebSocket(wsUrl);
                this.ws.onopen = () => {
                    this.errorOnClosedWs = true;
                    this.wsIsOpen = true;
                    this.initDataCount = 0;
                    eventBus.emit('wsOpen');
                    if(this.authenticationStore.userType == UserType.Admin) {
                        this.sendMessage({messageCode: WsMessageCode.UserCounters, content: {}});
                    }
                };
                this.ws.onclose = () => {
                    this.wsIsOpen = false;
                    eventBus.emit('wsClose');
                    if(this.errorOnClosedWs && this.initDataCount < 3 && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
                        this.initData(wsUrl);
                };
                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data) as WsMessage;
                    eventBus.emit('wsMessage', message);
                };
            }
            catch (e) {
                this.notificationStore.add(NotificationType.Error, e as string);
            }
        },

        closeWS() {
            if(this.ws && this.wsIsOpen) {
                this.errorOnClosedWs = false;
                this.ws.close();
            }
        },

    }
});