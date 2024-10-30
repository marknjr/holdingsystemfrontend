import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia} from 'pinia'
import axios, {AxiosError} from "axios";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {useNotificationStore} from "@/stores/NotificationStore";
import {NotificationType} from "@/model/UserNotification";
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import moment from "moment";
import {UserType} from "@/model/UserType";
import VueScreen from 'vue-screen';
import {useBookingEventsStore} from "@/stores/BookingEventsStore";
import {useTicketSubmissionsStore} from "@/stores/TicketSubmissionsStore";
import {useUserTipsStore} from "@/stores/UserTipsStore";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useLinksStore} from "@/stores/LinksStore";
import {useCommentsStore} from "@/stores/CommentsStore";




(async () => {
    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);
    app.use(VueScreen);


    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    //axios.defaults.params = {'XDEBUG_SESSION_START': 'PHPSTORM'}

    axios.interceptors.request.use((config) => {
        if(authenticationStore.loggedIn && (!config.httpAgent || !config.httpAgent.ignoreAuth))
            config.headers.Authorization = 'bearer ' + authenticationStore.jwt;
        return config;
    })

    axios.interceptors.response.use(async (response) => {
        if (authenticationStore.initialized && response.config.url != '/users/login' && response.status == 401) {
            await router.push({ path: '/login' })
        }
        return response;
    }, (error: AxiosError) => {
        if(error.config?.url != '/users/login')
            notificationStore.add(NotificationType.Error, error.message);
    });

    const authenticationStore = useAuthenticationStore();
    await authenticationStore.initializeStoredToken();
    const notificationStore = useNotificationStore();
    const dataStore = useDataStore();

    const bookingEventsStore = useBookingEventsStore();
    const ticketSubmissionsStore = useTicketSubmissionsStore();
    const userTipsStore = useUserTipsStore();
    const webSocketsStore = useWebSocketsStore();
    const linksStore = useLinksStore();
    const commentsStore = useCommentsStore();

    bookingEventsStore.setup();
    dataStore.setup();
    notificationStore.setup();
    ticketSubmissionsStore.setup();
    userTipsStore.setup();
    webSocketsStore.setup();
    linksStore.setup();
    commentsStore.setup();




    setInterval(async () => {
        if (authenticationStore.loggedIn) {
            try {
                const response = await axios.get('/users/extend');
                if (!response || response.status != 200) {
                    return;
                }
                if (!response.data.success) {
                    notificationStore.add(NotificationType.Error, response.data.error);
                    return;
                }

                authenticationStore.jwt = response.data.token;
                localStorage.setItem('jwt', authenticationStore.jwt);
            } catch (e) {
                notificationStore.add(NotificationType.Error, e as string);
            }
        }
    }, 1000 * 60 * 4);


    setInterval(() => {
        if(webSocketsStore.ws && webSocketsStore.ws.readyState == WebSocket.OPEN)
            webSocketsStore.sendMessage({
                messageCode: WsMessageCode.KeepAlive,
                content: '',
            })
    }, 10000);

    setInterval(() => {
        bookingEventsStore.checkUnenteredEvents();
    }, 10000);

    setInterval(() => {
        const currentTime = new Date();
        for(const submission of ticketSubmissionsStore.ticketSubmissions) {
            submission.passedTime = moment.utc(moment(currentTime).diff(submission.moment)).format('mm:ss');
            if(submission.last_minute) {
                submission.remainingLastMinute = Math.max(0, 60 - ~~(moment(currentTime).diff(moment.utc(submission.last_minute)) / 1000)).toString();
            }
        }

        if(authenticationStore.userType == UserType.Client)
            for(const event of bookingEventsStore.bookingEvents)
                event.canAddSubmissions = !event.paused && (!event.waiting_room || moment(currentTime).diff(moment(event.waiting_room)) >= 0)
    }, 1000)

    const setFullHeight = () => {
        document.body.style.height = `${window.innerHeight}px`;
    }
    setFullHeight();
    window.addEventListener('resize', setFullHeight);


    app.use(router)
    app.mount('#app')

    if (("Notification" in window) && Notification.permission === "default") {
        Notification.requestPermission();
    }
})();


