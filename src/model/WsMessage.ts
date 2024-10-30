export default interface WsMessage {
    messageCode: WsMessageCode,
    content: any
}

export enum WsMessageCode {
    Error = 0,
    AddUserTip = 1,
    EditUserTip = 2,
    DeleteUserTip = 3,
    AddBookingEvent = 4,
    EditBookingEvent = 5,
    DeleteBookingEvent = 6,
    AddTicketSubmission = 7,
    EditTicketSubmission = 8,
    DeleteTicketSubmission = 9,

    SortUserTips = 10,
    SortBookingEvents = 11,

    ResetApp = 12,
    KeepAlive = 13,

    SubmissionHold = 14,
    SetLastMinute = 15,

    UnlockEvent = 16,

    ListUnenteredEvents = 17,
    EnterEvents = 18,
    UserCounters = 19,
    CallResult=20,

    AddLink = 21,
    EditLink = 22,
    DeleteLink = 23,

    ActivateLinkSet = 24,
    AddLinkSet = 25,

    AddComment = 26,

    SortLinks = 27

}
