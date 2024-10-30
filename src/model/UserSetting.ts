// src/model/UserSetting.ts
export default interface UserSetting {
    id: number;
    user_code: string;
    email: string;
    phone_number: string;
    sms_received: boolean;
  }
  
  // Default values for a new user setting
  export function DefaultUserSetting(): UserSetting {
    return {
      id: 0,
      user_code: '',
      email: '',
      phone_number: '',
      sms_received: false
    };
  }
  