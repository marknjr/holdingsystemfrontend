export default interface Comment {
    id: number;
    ticket_submission_id: number;
    moment: Date;
    by_admin: boolean,
    content: string;
}

export function DefaultComment(): Comment {
    return {
        id: 0,
        ticket_submission_id: 0,
        moment: new Date(),
        by_admin: false,
        content: '',
    };
}