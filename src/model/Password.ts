export default interface Password {
    id: number;
    user_code: string;
    site: string;
    email: string;
    decrypted_password: string;
    main: boolean;
}

export function DefaultPassword(): Password {
    return {
        id: 0,
        user_code: '',
        site: '',
        email: '',
        decrypted_password: '',
        main: false
    };
}