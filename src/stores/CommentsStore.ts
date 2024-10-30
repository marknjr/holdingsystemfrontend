import {defineStore} from "pinia";
import eventBus from "@/EventBus.js";
import {WsMessageCode} from "@/model/WsMessage";
import type Comment from "@/model/Comment";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import type TicketSubmission from "@/model/TicketSubmission";

export const useCommentsStore = defineStore('comments', {
    state: () => {
        return {
            modalOpen: false,
            modalSubmission: null as TicketSubmission | null,
            modalMessage: ''
        }
    },
    getters: {
        ticketSubmissionsStore: state => useTicketSubmissionsStore(),
    },
    actions: {
        setup() {
            eventBus.on('wsMessage', (message) => {
                switch (message.messageCode) {
                    case WsMessageCode.AddComment:
                        this.addComment(message.content)
                        break;
                }
            })
        },
        initData() {
        },

        addComment(comment: Comment) {
            const submission = this.ticketSubmissionsStore.submissionsDictionary[comment.ticket_submission_id];
            if(submission) {
                if(!submission.comments)
                    submission.comments = [];
                submission.comments.push(comment);
                if(!this.modalOpen || submission.id != this.modalSubmission?.id)
                    submission.unreadComments = true;
                eventBus.emit('commentModalOpened');
            }
        },

        openModal(submission: TicketSubmission) {
            this.modalSubmission = submission;
            this.modalMessage = '';
            this.modalOpen = true;
            eventBus.emit('commentModalOpened');
            submission.unreadComments = false;
        }
    }
});