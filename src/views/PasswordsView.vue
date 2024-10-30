<script lang="ts">
import {defineComponent} from 'vue'
import type Password from "@/model/Password";
import {DefaultPassword} from "@/model/Password";
import {useNotificationStore} from "@/stores/NotificationStore";
import axios from "axios";
import {NotificationType} from "@/model/UserNotification";
import PageWrapper from "@/components/PageWrapper.vue";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {UserType} from "@/model/UserType";
import PasswordRow from "@/components/PasswordRow.vue";

export default defineComponent({
  name: "PasswordsView",
  components: {PasswordRow, PageWrapper},
  data() {
      return {
        // loginRequired: true,
        // loginPassword: '',
        tempPassword: DefaultPassword(),
        passwords: [] as Password[],
        filterUserCode: '',
        filterEmail: '',
        filterSite: '',
        filterPassword: '',
        filterMain: null as boolean | null,
      }
  },
  computed: {
    UserType() {
      return UserType
    },
    visiblePasswords(): Password[] {
      return this.passwords.filter((password) => {
        if(this.filterUserCode && !password.user_code.toLowerCase().includes(this.filterUserCode.toLowerCase()))
          return false;

        if(this.filterSite && !password.site.toLowerCase().includes(this.filterSite.toLowerCase()))
          return false;

        if(this.filterEmail && !password.email.toLowerCase().includes(this.filterEmail.toLowerCase()))
          return false;

        if(this.filterPassword && !password.decrypted_password.toLowerCase().includes(this.filterPassword.toLowerCase()))
          return false;

        return !(this.filterMain !== null && password.main != this.filterMain);
      }).sort((a, b) => {
        let r = 0;
        if(a.email.toLowerCase() > b.email.toLowerCase())
          r = 1;
        else if(a.email.toLowerCase() < b.email.toLowerCase())
          r = -1;

        if(a.user_code.toLowerCase() > b.user_code.toLowerCase())
          r = 1;
        else if(a.user_code.toLowerCase() < b.user_code.toLowerCase())
          r = -1;
        return r;
      })
    },
    submitValidation() {
      return {
        user_code: !!this.tempPassword.user_code
            && this.tempPassword.user_code === this.tempPassword.user_code.toUpperCase()
            && this.tempPassword.user_code.endsWith("1"),
        site: !!this.tempPassword.site,
        email: this.checkEmailValid(this.tempPassword.email),
        password: !!this.tempPassword.decrypted_password,
      } as any
    },
    notificationStore: () => useNotificationStore(),
    authenticationStore: () => useAuthenticationStore()
  },
  methods: {
    clearFilters() {
      this.filterUserCode = '';
      this.filterSite = '';
      this.filterEmail = '';
      this.filterPassword = '';
      this.filterMain = null;
    },
    checkEmailValid(email: string) {
      if(!email)
        return false;
      const validProiders = ['@gmail.com', '@yahoo.com', '@outlook.com'];
      for(const provider of validProiders)
        if(email.toLowerCase().endsWith(provider))
          return true;
      return false;
    },
    // async checkLogin() {
    //   const passwordCorrect = await this.authenticationStore.checkCredentials(this.authenticationStore.userCode, this.loginPassword);
    //   if(!passwordCorrect) {
    //     this.notificationStore.add(NotificationType.Error, "Invalid Password");
    //     return;
    //   }
    //   this.loginRequired = false;
    //   try {
    //     const response = await axios.get('/passwords/index');
    //     if(!response || response.status != 200) {
    //       this.notificationStore.add(NotificationType.Error, 'Could not load the initial data');
    //       return;
    //     }
    //     this.passwords = response.data;
    //   }
    //   catch (e) {
    //     this.notificationStore.add(NotificationType.Error, e as string);
    //   }
    // },
    async createPassword() {

      for(const validation in this.submitValidation)
        if(!this.submitValidation[validation])
          return;
      try {
        const response = await axios.post('/passwords/add', this.tempPassword);
        if(!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not process the request');
          return;
        }
        this.passwords.push(response.data);
      }
      catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }

      this.resetFields();
    },

    resetFields() {
      this.tempPassword = DefaultPassword();
      if(this.authenticationStore.userType == UserType.Client)
        this.tempPassword.user_code = this.authenticationStore.userCode
    },

    async deletePassword(password: Password) {
      try {
        const response = await axios.post('/passwords/delete/'+password.id);
        if(!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not process the request');
          return;
        }
        this.passwords.splice(this.passwords.indexOf(password), 1);
      }
      catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },

    async editPassword(tempObj: Password, originalObj: Password) {
      try {
        const response = await axios.post('/passwords/edit/'+tempObj.id, tempObj);
        if(!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not process the request');
          return;
        }
        Object.assign(originalObj, response.data);
      }
      catch (e) {
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },

    exportSelection() {
      let processRow = (row: any) => {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
          let innerValue = row[j] === null ? '' : row[j].toString();
          if (row[j] instanceof Date)
            innerValue = row[j].toLocaleString();
          let result = innerValue.replace(/"/g, '""');
          if (result.search(/([",\n])/g) >= 0)
            result = '"' + result + '"';
          if (j > 0)
            finalVal += ',';
          finalVal += result;
        }
        return finalVal + '\n';
      };

      let csvFile = processRow(['User Code', 'Site', 'Email', 'Password']);
      for(const password of this.visiblePasswords) {
        csvFile += processRow([password.user_code, password.site, password.email, password.decrypted_password]);
      }

      const filename = "password_export.csv";

      let blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      if ((navigator as any).msSaveBlob) { // IE 10+
        (navigator as any).msSaveBlob(blob, filename);
      } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
  },

  async created() {
  this.resetFields();
  try {
    const response = await axios.get('/passwords/index');
    if (!response || response.status != 200) {
      this.notificationStore.add(NotificationType.Error, 'Could not load the initial data');
      return;
    }
    this.passwords = response.data;
  } catch (e) {
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
          <th v-if="authenticationStore.userType == UserType.Admin">User Code</th>
          <th>Site</th>
          <th>Email</th>
          <th>Password</th>
          <th>Main</th>
          <th class="w-[150px]"></th>
        </tr>
        <tr class="bg-blue-300">
          <td v-if="authenticationStore.userType == UserType.Admin">
            <input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterUserCode" />
          </td>
          <td>
            <input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterSite" />
          </td>
          <td>
            <input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterEmail" />
          </td>
          <td>
            <input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="filterPassword" />
          </td>
          <td>
            <input type="checkbox" class="checkbox checkbox-warning checkbox-sm" v-bind:indeterminate.prop="filterMain === null" v-model="filterMain" />
          </td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-xs btn-info flex-grow" @click="clearFilters">Clear</button>
              <button class="btn btn-xs btn-success flex-grow" @click="exportSelection">Export</button>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>
        <password-row
          v-for="password in visiblePasswords"
          :key="password.id"
          :password="password"
          @delete-password="deletePassword"
          @edit-password="editPassword"
        />

        <tr class="bg-blue-200">
          <td v-if="authenticationStore.userType == UserType.Admin">
            <input
              type="text"
              :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.user_code ? '' : ' input-error')"
              v-model="tempPassword.user_code"
            />
          </td>
          <td>
            <input
              type="text"
              :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.site ? '' : ' input-error')"
              v-model="tempPassword.site"
            />
          </td>
          <td>
            <input
              type="text"
              :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.email ? '' : ' input-error')"
              v-model="tempPassword.email"
            />
          </td>
          <td>
            <input
              type="text"
              autocomplete="new-password"
              :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.password ? '' : ' input-error')"
              v-model="tempPassword.decrypted_password"
            />
          </td>
          <td>
            <input type="checkbox" class="toggle toggle-warning toggle-sm" v-model="tempPassword.main" />
          </td>
          <td>
            <button class="btn btn-xs btn-warning w-full" @click="createPassword()">Submit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </page-wrapper>
</template>

<style scoped>

</style>