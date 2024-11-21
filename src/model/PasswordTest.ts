export default interface PasswordTest {
    id: number;
    user_code: string;
    site: string;
    email: string;
    decrypted_password: string;
    main: boolean;
    phone_number: string;
    slack_id: string;
}

export const DefaultPasswordTest = (): PasswordTest => ({
    id: 0,
    user_code: '',
    site: '',
    email: '',
    decrypted_password: '',
    main: false,
    phone_number: '',
    slack_id: ''
})