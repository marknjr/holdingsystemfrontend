<script lang="ts">
import {defineComponent} from 'vue';
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import router from "@/router";
import {useNotificationStore} from "@/stores/NotificationStore";
import {NotificationType} from "@/model/UserNotification";
import {useDataStore} from "@/stores/DataStore";
import {UserType} from "@/model/UserType";

export default defineComponent({
  name: "LoginView.vue",
  computed: {
    authenticationStore() {
      return useAuthenticationStore();
    },
    notificationStore() {
      return useNotificationStore();
    },
    dataStore() {
      return useDataStore();
    },
  },
  data() {
    return {
      userCode: '',
      password: '',
      remember_me: false
    }
  },
  methods: {
    async submitLogin() {
      const result = await this.authenticationStore.login(this.userCode, this.password, this.remember_me);
      if (result) {
        await this.dataStore.initData();
        await router.push({path: this.authenticationStore.userType == UserType.Client ? '/client' : '/submissions'})
      } else
        this.notificationStore.add(NotificationType.Error, 'Invalid username or password.');
    },

  },
})
</script>

<template>



  <div class="h-screen w-screen flex flex-col bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl m-auto">
      <div class="card-body">
        <h2 class="card-title mx-auto">TT Advice Portal</h2>
        <form @submit.prevent="submitLogin">
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">User Code</span>
            </label>
            <input v-model="userCode" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs"/>
          </div>

          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input v-model="password" type="password" placeholder="Type here"
                   class="input input-bordered w-full max-w-xs"/>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer justify-start">
              <input type="checkbox" v-model="remember_me" class="checkbox"/>
              <span class="label-text ms-2">Remember me</span>
            </label>
          </div>
          <div class="card-actions">
            <button type="submit" class="btn btn-primary w-full mt-3">Log In</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>