import { defineStore } from 'pinia'
import type UserNotification from "@/model/UserNotification";
import {NotificationType} from "@/model/UserNotification";
import eventBus from "@/EventBus.js";
import {WsMessageCode} from "@/model/WsMessage";

export const useNotificationStore = defineStore('notification', {
    state: () => {
        return {
            notifications: [] as UserNotification[],
            callStack: null as any
        }
    },
    actions: {
        setup() {
            eventBus.on('wsMessage', (message) => {
                switch (message.messageCode) {
                    case WsMessageCode.Error:
                        this.add(NotificationType.Error, message.content.message);
                        break;
                }
            })
        },
        add (type: NotificationType, message: string) {
            this.notifications.push({
                type: type,
                message: message,
                id: (Math.random() + 1).toString(36).substring(7)
            });
        },

        dismiss(notification: UserNotification) {
            this.notifications.splice(this.notifications.indexOf(notification), 1);
        }
    },
})

