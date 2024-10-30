export default interface UserTip {
    id: number;
    priority: number;
    title: string;
    content: string;
}

export function DefaultUserTip(): UserTip {
    return {
        id: 0,
        priority: 0,
        title: '',
        content: '',
    };
}