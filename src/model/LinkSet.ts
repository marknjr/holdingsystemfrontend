import type Link from "@/model/Link";

export default interface LinkSet {
    id: number;
    name: string;
    access_code: string;

    links: Link[];
}

export function DefaultLinkSet(): LinkSet {
    return {
        id: 0,
        name: '',
        access_code: '',
        links: []
    };
}