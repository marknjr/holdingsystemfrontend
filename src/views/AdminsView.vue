<script lang="ts">
import {defineComponent} from 'vue'
import PageWrapper from "@/components/PageWrapper.vue";
import type Admin from "@/model/Admin";
import axios from "axios";
import {NotificationType} from "@/model/UserNotification";
import {useNotificationStore} from "@/stores/NotificationStore";
import AdminRow from "@/components/AdminRow.vue";

export default defineComponent({
  name: "AdminsView",
  components: {AdminRow, PageWrapper},

  data() {
    return {
      tempAdmin: {
        id: 0,
        name: '',
        username: '',
        password: '',
      } as Admin,

      admins: [] as Admin[]
    }
  },

  computed: {

    submitValidation() {
      return {
        name: !!this.tempAdmin.name,
        username: !!this.tempAdmin.username,
        password: !!this.tempAdmin.password,
      } as any
    },
    notificationStore: () => useNotificationStore()
  },

  methods: {
    async createAdmin() {

      for(const validation in this.submitValidation)
        if(!this.submitValidation[validation])
          return;

      try {
        const response = await axios.post('/admins/add', this.tempAdmin);
        if(!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not process the request');
          return;
        }
        if(!response.data.success) {
          this.notificationStore.add(NotificationType.Error, response.data.error);
          return;
        }
        this.tempAdmin.password = '';
        this.admins.push(Object.assign({}, this.tempAdmin));
      }
      catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }

      this.resetFields();
    },

    resetFields() {
      this.tempAdmin = {
        id: 0,
        name: '',
        username: '',
        password: '',
      } as Admin;
    },

    async deleteAdmin(admin: Admin) {
      try {
        const response = await axios.post('/admins/delete', admin);
        if(!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not process the request');
          return;
        }
        if(!response.data.success) {
          this.notificationStore.add(NotificationType.Error, response.data.error);
          return;
        }
        this.admins.splice(this.admins.indexOf(admin), 1);
      }
      catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },

    async editAdmin(tempObj: Admin, originalObj: Admin) {
      try {
        const response = await axios.post('/admins/edit', tempObj);
        if(!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not process the request');
          return;
        }
        if(!response.data.success) {
          this.notificationStore.add(NotificationType.Error, response.data.error);
          return;
        }
        tempObj.password = '';
        Object.assign(originalObj, tempObj);
      }
      catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    }
  },

  async created() {
    try {
      const response = await axios.get('/admins/index');
      if(!response || response.status != 200) {
        this.notificationStore.add(NotificationType.Error, 'Could not load the initial data');
        return;
      }
      if(!response.data.success) {
        this.notificationStore.add(NotificationType.Error, response.data.error);
        return;
      }
      this.admins = response.data.admins;
    }
    catch (e) {
      this.notificationStore.add(NotificationType.Error, e as string);
    }
  }
})
</script>

<template>
  <page-wrapper>
    <table class="table table-xs table-pin-rows z-0">
      <thead class="table-md">
      <tr>
        <th>Name</th>
        <th>Username</th>
        <th>Password</th>
        <th class="w-[150px]"></th>
      </tr>
      </thead>
      <tbody>
      <tr class="bg-blue-200">
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.name ? '' : ' input-error')" v-model="tempAdmin.name" /></td>
        <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.username ? '' : ' input-error')" v-model="tempAdmin.username" /></td>
        <td><input type="password" autocomplete="new-password" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.password ? '' : ' input-error')" v-model="tempAdmin.password" /></td>

        <td>
          <button class="btn btn-xs btn-warning w-full" @click="createAdmin()">Submit</button>
        </td>
      </tr>
      <admin-row v-for="admin in admins" :key="admin.id" :admin="admin" @delete-admin="deleteAdmin" @edit-admin="editAdmin"/>
      </tbody>
    </table>
  </page-wrapper>
</template>