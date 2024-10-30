import {defineStore} from "pinia";

export const useSoundStore = defineStore('sound', {
    state: () => {
        return {
            positiveSound: new Audio('/positive.wav'),
            negativeSound: new Audio('/negative.wav'),
            neutralSound: new Audio('/neutral.wav'),
        }
    }
});