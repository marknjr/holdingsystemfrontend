import {defineStore} from 'pinia'
import {UserType} from "@/model/UserType";
import axios from "axios";
import router from "@/router";
import {useDataStore} from "@/stores/DataStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";

export const useAuthenticationStore = defineStore('authentication', {
    state: () => {
        return {
            userCode: '',
            userType: UserType.Client as UserType,
            jwt: '',
            loggedIn: false,
            initialized: false,
        }
    },
    actions: {
        async initializeStoredToken() {
            if(this.initialized)
                return;
            const storedToken = localStorage.getItem('jwt');
            if(storedToken) {
                this.loggedIn = true;
                this.jwt = storedToken;
                const tokenCheck = await this.login('', '');
                if(tokenCheck) {
                    await useDataStore().initData();
                }
            }
            this.initialized = true;
        },
        async checkCredentials(userCode: string, password: string) {
            try {
                const response = await axios.post('/users/login', {
                    'user_code': userCode,
                    'password': password,
                    'remember_me': '0'
                }, {httpAgent: {ignoreAuth: true}})
                if(!response || response.status != 200)
                    return false;
                return true;
            }
            catch (e) {
                return false;
            }
        },
        async login(userCode: string, password: string, rememberMe = false) {
            try {
                const response = await axios.post('/users/login', {
                    'user_code': userCode,
                    'password': password,
                    'remember_me': rememberMe ? '1' : '0'
                })
                if(!response || response.status != 200) {
                    this.userCode = '';
                    this.userType = UserType.Client;
                    this.jwt = '';
                    this.loggedIn = false;
                    localStorage.removeItem('jwt');
                    return false;
                }
                this.userCode = response.data.user_code;
                this.userType = response.data.user_type;
                this.jwt = response.data.token;
                this.loggedIn = true;
                localStorage.setItem('jwt', this.jwt);
                return true;
            }
            catch (e) {
                this.userCode = '';
                this.userType = UserType.Client;
                this.jwt = '';
                this.loggedIn = false;
                localStorage.removeItem('jwt');
                return false;
            }
        },

        logout() {
            this.userCode = '';
            this.userType = UserType.Client;
            this.jwt = '';
            this.loggedIn = false;
            localStorage.removeItem('jwt');
            router.push({path: '/login'});
            useWebSocketsStore().closeWS();
        }
    },
});
