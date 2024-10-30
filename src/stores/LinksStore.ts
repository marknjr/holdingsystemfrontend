import {defineStore} from "pinia";
import type Link from "@/model/Link";
import type LinkSet from "@/model/LinkSet";
import type BookingEvent from "@/model/BookingEvent";
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import eventBus from "@/EventBus.js";
import {WsMessageCode} from "@/model/WsMessage";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {UserType} from "@/model/UserType";
import type SortingData from "@/model/SortingData";
import type UserTip from "@/model/UserTip";
import {DefaultLink} from "@/model/Link";

export const useLinksStore = defineStore('links', {
    state: () => {
        return {
            linkSets: [] as LinkSet[],
            linksDictionary: {} as {[key: number]: Link},
            linkSetsDictionary: {} as {[key: number]: LinkSet},

            eventsLinkModalData: null as BookingEvent | null,
            eventsLinkModalOpen: false,

            linkSetModalData: null as LinkSet | null,
            linkSetModalOpen: false,

            copyModalOpen: false,

            linkSetActivationCode: null as string | null,

            dragDropLink: DefaultLink()
        }
    },
    getters: {
        bookingEventsStore: state => useBookingEventsStore(),
        authenticationStore: state => useAuthenticationStore(),
        webSocketsStore: state => useWebSocketsStore(),
    },
    actions: {
        setup() {
            eventBus.on('wsMessage', (message) => {
                switch (message.messageCode) {
                    case WsMessageCode.AddLink:
                        this.addLink(message.content.link, message.content.linkSet)
                        break;
                    case WsMessageCode.EditLink:
                        this.editLink(message.content.link, message.content.linkSet)
                        break;
                    case WsMessageCode.DeleteLink:
                        this.deleteLink(message.content)
                        break;
                    case WsMessageCode.AddLinkSet:
                        this.addLinkSet(message.content);
                        break;
                    case WsMessageCode.SortLinks:
                        this.sortLinks(message.content);
                        break;
                }
            });
            eventBus.on('loggedInChanged', (loggedIn) => {
                if(loggedIn && this.linkSetActivationCode)
                    this.activateLinkSet(this.linkSetActivationCode);
            });
            eventBus.on("wsOpen", () => {
                if(this.linkSetActivationCode)
                    this.activateLinkSet(this.linkSetActivationCode);
            })
        },
        initData(linkSets: LinkSet[]) {
            this.linkSets = linkSets;
            this.linkSetsDictionary = {};
            this.linksDictionary = {};

            for(const linkSet of linkSets) {
                this.linkSetsDictionary[linkSet.id] = linkSet;
                for(const link of linkSet.links) {
                    link.link_set_name = linkSet.name;
                    this.linksDictionary[link.id] = link;
                    const event = this.bookingEventsStore.eventsDictionary[link.booking_event_id];
                    if(!event)
                        continue;
                    if(!event.links)
                        event.links = [];
                    event.links.push(link);
                }
            }
            for(const event of this.bookingEventsStore.bookingEvents)
                this.sortEventLinks(event);
        },
        addLink(link: Link, linkSet: LinkSet) {
            link.link_set_name = linkSet.name;
            this.linksDictionary[link.id] = link;
            const event = this.bookingEventsStore.eventsDictionary[link.booking_event_id];
            if(this.linkSetsDictionary[linkSet.id] === undefined) {
                this.linkSetsDictionary[linkSet.id] = linkSet;
                this.linkSets.push(linkSet);
            }
            else
                linkSet = this.linkSetsDictionary[linkSet.id];
            if(!linkSet.links)
                linkSet.links = [];
            linkSet.links.push(link);
            if(!event)
                return;
            if(!event.links)
                event.links = [];
            event.links.push(link);
            this.sortEventLinks(event);

        },

        editLink(link: Link, linkSet: LinkSet) {
            const oldLink = this.linksDictionary[link.id];
            if(oldLink.link_set_id != link.link_set_id) {
                const oldLinkSet = this.linkSetsDictionary[oldLink.link_set_id];
                oldLinkSet.links.splice(oldLinkSet.links.indexOf(oldLink), 1);
                if(!oldLinkSet.links.length) {
                    this.linkSets.splice(this.linkSets.indexOf(oldLinkSet), 1);
                    delete this.linkSetsDictionary[oldLinkSet.id];
                }
                if(this.linkSetsDictionary[linkSet.id] === undefined) {
                    this.linkSetsDictionary[linkSet.id] = linkSet;
                    this.linkSets.push(linkSet);
                }
                else
                    linkSet = this.linkSetsDictionary[linkSet.id];
                if(!linkSet.links)
                    linkSet.links = [];
                linkSet.links.push(oldLink);
            }
            Object.assign(this.linksDictionary[link.id], link);
            oldLink.link_set_name = linkSet.name;
        },

        deleteLink(link: Link) {
            const realLink = this.linksDictionary[link.id];
            const event = this.bookingEventsStore.eventsDictionary[link.booking_event_id];
            const linkSet = this.linkSetsDictionary[link.link_set_id];
            linkSet.links.splice(linkSet.links.indexOf(realLink), 1);
            if(!linkSet.links.length) {
                this.linkSets.splice(this.linkSets.indexOf(linkSet), 1);
                delete this.linkSetsDictionary[linkSet.id];
            }
            delete this.linksDictionary[link.id];
            if(event && event.links)
                event.links.splice(event.links.indexOf(realLink), 1);
        },

        sortLinks(sortingData: SortingData) {
            for(const event of this.bookingEventsStore.bookingEvents) {
                if(!event.links)
                    continue;
                let needsSorting = false;
                for (const link of event.links) {
                    if(link.priority >= sortingData.index) {
                        link.priority++;
                        needsSorting = true;
                    }
                    if(link.id == sortingData.id) {
                        link.priority = sortingData.index;
                        needsSorting = true;
                    }
                }
                if(needsSorting)
                    this.sortEventLinks(event);
            }
        },

        activateLinkSet(accessCode: string) {
            if(this.authenticationStore.loggedIn && this.webSocketsStore.wsIsOpen) {
                for(const linkSet of this.linkSets)
                    if(linkSet.access_code == accessCode) {
                        this.openSetModal(linkSet);
                        return;
                    }
                this.webSocketsStore.sendMessage({messageCode: WsMessageCode.ActivateLinkSet, content: accessCode});
                this.linkSetActivationCode = null;
            }
            else
                this.linkSetActivationCode = accessCode;
        },

        addLinkSet(linkSet: LinkSet) {
            this.linkSetsDictionary[linkSet.id] = linkSet;
            this.linkSets.push(linkSet);
            for(const link of linkSet.links) {
                link.link_set_name = linkSet.name;
                this.linksDictionary[link.id] = link;
                const event = this.bookingEventsStore.eventsDictionary[link.booking_event_id];
                if(!event)
                    continue;
                if(!event.links)
                    event.links = [];
                event.links.push(link);
            }
            if(this.authenticationStore.userType == UserType.Client)
                this.openSetModal(linkSet);
        },



        openEventModal(event: BookingEvent) {
            this.eventsLinkModalData = event;
            this.eventsLinkModalOpen = true;
        },

        openSetModal(linkSet: LinkSet) {
            this.linkSetModalData = linkSet;
            this.copyModalOpen = false;
            this.linkSetModalOpen = true;
        },

        dragLink(link: Link) {
            Object.assign(this.dragDropLink, link);
        },
        dropLink(link: Link) {
            this.webSocketsStore.sendMessage({
                messageCode: WsMessageCode.SortLinks,
                content: {
                    id: this.dragDropLink.id,
                    index: this.dragDropLink.priority > link.priority ? link.priority : link.priority + 1
                } as SortingData
            })
        },

        sortEventLinks(event: BookingEvent) {
            if(event && event.links)
                event.links.sort((a,b) => a.priority - b.priority);
        }
    }
})