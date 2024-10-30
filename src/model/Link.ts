export default interface Link {
    id: number;
    booking_event_id: number;
    link_set_id: number;
    name: string,
    access_code: string;
    url?: string;
    link_set_name?: string;
    priority: number;
}

export function DefaultLink(): Link {
    return {
        id: 0,
        booking_event_id: 0,
        link_set_id: 0,
        name: '',
        access_code: '',
        priority: 0
    };
}