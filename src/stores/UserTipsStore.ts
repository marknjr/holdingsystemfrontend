import {defineStore} from "pinia";
import type SortingData from "@/model/SortingData";
import type UserTip from "@/model/UserTip";
import eventBus from "@/EventBus.js";
import {WsMessageCode} from "@/model/WsMessage";

export const useUserTipsStore = defineStore('userTips', {
    state: () => {
        return {
            userTips: [] as UserTip[],
            tipsDictionary: {} as {[key: number]: UserTip},
        }
    },
    getters: {
        sortedTips: (state) => state.userTips.sort((a,b) => a.priority - b.priority),
    },
    actions: {
        setup() {
            eventBus.on('wsMessage', (message) => {
                    switch (message.messageCode) {
                        case WsMessageCode.AddUserTip:
                            this.addUserTip(message.content)
                            break;
                        case WsMessageCode.EditUserTip:
                            this.editUserTip(message.content)
                            break;
                        case WsMessageCode.DeleteUserTip:
                            this.deleteUserTip(message.content)
                            break;
                        case WsMessageCode.SortUserTips:
                            this.sortUserTips(message.content)
                            break;
                    }
            })
        },
        initData(initialTips: UserTip[]) {
            this.userTips = initialTips;
            this.tipsDictionary = {};
            for(const userTip of this.userTips)
                this.tipsDictionary[userTip.id] = userTip
        },

        addUserTip(userTip: UserTip) {
            this.userTips.push(userTip);
            this.tipsDictionary[userTip.id] = userTip;
        },

        editUserTip(userTip: UserTip) {
            Object.assign(this.tipsDictionary[userTip.id], userTip);
        },

        deleteUserTip(userTip: UserTip) {
            const realTip = this.tipsDictionary[userTip.id] as UserTip;
            this.userTips.splice(this.userTips.indexOf(realTip), 1);
            delete this.tipsDictionary[userTip.id];
        },

        sortUserTips(sortingData: SortingData) {
            for(const userTip of this.userTips)
                if(userTip.priority >= sortingData.index)
                    userTip.priority++;
            (this.tipsDictionary[sortingData.id] as UserTip).priority = sortingData.index;
        },
    }
});