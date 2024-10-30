export default interface UserNotification {
    id: string,
    type: NotificationType,
    message: string
}

export enum NotificationType {
    Info = 0,
    Success = 1,
    Error = 2
}