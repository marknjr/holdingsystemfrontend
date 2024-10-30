<template>
  <page-wrapper>
    <div v-if="loginRequired" class="w-full h-full flex">
      <div class="card w-96 bg-base-100 shadow-xl m-auto">
        <div class="card-body">
          <h2 class="card-title mx-auto">Re-enter Your Password</h2>
          <form @submit.prevent="checkLogin">
            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input
                v-model="loginPassword"
                type="password"
                placeholder="Type here"
                class="input input-bordered w-full max-w-xs"
              />
            </div>
            <div class="card-actions">
              <button type="submit" class="btn btn-primary w-full mt-3">
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <table class="table table-xs table-fixed table-pin-rows z-0">
      <thead class="table-md">
        <tr>
          <th
            v-if="authenticationStore.userType == UserType.Admin"
            class="w-1/12 cursor-pointer"
            @click="sortData('user_code')"
          >
            User Code
            <span v-if="sortColumn === 'user_code'">
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </span>
          </th>
          <th class="w-1/12 cursor-pointer" @click="sortData('site')">
            Site
            <span v-if="sortColumn === 'site'">
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </span>
          </th>
          <th class="w-2/12 cursor-pointer" @click="sortData('email')">
            Email
            <span v-if="sortColumn === 'email'">
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </span>
          </th>
          <th class="w-1/12 cursor-pointer" @click="sortData('decrypted_password')">
            Password
            <span v-if="sortColumn === 'decrypted_password'">
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </span>
          </th>
          <th class="w-2/12 cursor-pointer" @click="sortData('phone_number')">
            Phone Number
            <span v-if="sortColumn === 'phone_number'">
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </span>
          </th>
          <th class="w-1/12 cursor-pointer" @click="sortData('sms_received')">
            SMS Received
            <span v-if="sortColumn === 'sms_received'">
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </span>
          </th>
          <th class="w-1/12">Address</th>
          <th class="w-2/12"></th>
        </tr>
        <tr class="bg-blue-300">
          <td v-if="authenticationStore.userType == UserType.Admin">
            <input type="text" class="input input-bordered input-xs w-full" v-model="filterUserCode" />
          </td>
          <td><input type="text" class="input input-bordered input-xs w-full" v-model="filterSite" /></td>
          <td><input type="text" class="input input-bordered input-xs w-full" v-model="filterEmail" /></td>
          <td><input type="text" class="input input-bordered input-xs w-full" v-model="filterPassword" /></td>
          <td><input type="text" class="input input-bordered input-xs w-full" v-model="filterPhone" /></td>
          <td>
            <input
              type="checkbox"
              class="checkbox checkbox-warning checkbox-sm"
              v-bind:indeterminate.prop="filterSMSReceived === null"
              v-model="filterSMSReceived"
            />
          </td>
          <td></td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-xs btn-info flex-grow" @click="clearFilters">Clear</button>
              <button class="btn btn-xs btn-success flex-grow" @click="exportSelection">Export</button>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="setting in visibleUserSettings" :key="setting.id">
          <td v-if="authenticationStore.userType == UserType.Admin">{{ setting.user_code }}</td>
          <td>{{ setting.site }}</td>
          <td>
            <div class="flex items-center justify-between w-full overflow-hidden">
              <span class="truncate">{{ setting.email }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(setting.email)">📋</button>
            </div>
          </td>
          <td>
            <div class="flex items-center justify-between w-full overflow-hidden">
              <span class="truncate">{{ setting.decrypted_password }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(setting.decrypted_password)">📋</button>
            </div>
          </td>
          <td>
            <div v-if="setting.phone_number" class="flex items-center justify-between w-full overflow-hidden">
              <span class="truncate">{{ setting.phone_number }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(setting.phone_number)">📋</button>
            </div>
            <div v-else class="text-gray-500">Not Available</div>
          </td>
          <td>{{ setting.sms_received ? 'Yes' : 'No' }}</td>
          <td>
            <button 
              class="btn btn-xs btn-primary" 
              @click="fetchUserAddress(setting.user_code)"
              :disabled="loadingAddress"
            >
              {{ loadingAddress ? 'Loading...' : 'View Address' }}
            </button>
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <!-- Address Modal -->
    <div v-if="showAddressModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 class="text-lg font-bold mb-4">Address Information</h3>
        <div v-if="currentAddress" class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="font-semibold">Address Line 1:</span>
            <div class="flex items-center gap-2">
              <span>{{ currentAddress.address_line_1 }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(currentAddress.address_line_1)">📋</button>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="font-semibold">Address Line 2:</span>
            <div class="flex items-center gap-2">
              <span>{{ currentAddress.address_line_2 }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(currentAddress.address_line_2)">📋</button>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="font-semibold">City:</span>
            <div class="flex items-center gap-2">
              <span>{{ currentAddress.address_city }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(currentAddress.address_city)">📋</button>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="font-semibold">State:</span>
            <div class="flex items-center gap-2">
              <span>{{ currentAddress.address_state }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(currentAddress.address_state)">📋</button>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="font-semibold">ZIP:</span>
            <div class="flex items-center gap-2">
              <span>{{ currentAddress.address_zip }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(currentAddress.address_zip)">📋</button>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="font-semibold">Country:</span>
            <div class="flex items-center gap-2">
              <span>{{ currentAddress.country }}</span>
              <button class="btn btn-xs btn-ghost" @click="copyToClipboard(currentAddress.country)">📋</button>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="btn btn-sm btn-primary" @click="closeAddressModal">Close</button>
        </div>
      </div>
    </div>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageWrapper from '@/components/PageWrapper.vue';
import axios from 'axios';
import { useNotificationStore } from '@/stores/NotificationStore';
import { NotificationType } from '@/model/UserNotification';
import { useAuthenticationStore } from '@/stores/AuthenticationStore';
import { UserType } from '@/model/UserType';

interface UserSetting {
  id: number;
  user_code: string;
  site: string;
  email: string;
  decrypted_password: string;
  main: boolean;
  phone_number: string;
  sms_received: boolean;
  sms_contents: string[];
}

interface AddressInfo {
  user_code: string;
  address_line_1: string;
  address_line_2: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  country: string;
}

export default defineComponent({
  name: 'UserSettingsView',
  components: { PageWrapper },

  data() {
    return {
      loginRequired: false,
      loginPassword: '',
      userSettings: [] as UserSetting[],
      filterUserCode: '',
      filterSite: '',
      filterEmail: '',
      filterPassword: '',
      filterPhone: '',
      filterSMSReceived: null as boolean | null,
      filterMain: null as boolean | null,
      sortColumn: '',
      sortOrder: 'asc' as 'asc' | 'desc',
      showAddressModal: false,
      currentAddress: null as AddressInfo | null,
      loadingAddress: false,
    };
  },

  computed: {
    notificationStore: () => useNotificationStore(),
    authenticationStore: () => useAuthenticationStore(),
    UserType() {
      return UserType;
    },

    visibleUserSettings() {
      let filteredSettings = this.userSettings.filter((setting) => {
        if (
          this.filterUserCode &&
          !setting.user_code.toLowerCase().includes(this.filterUserCode.toLowerCase())
        )
          return false;

        if (
          this.filterSite &&
          !setting.site.toLowerCase().includes(this.filterSite.toLowerCase())
        )
          return false;

        if (
          this.filterEmail &&
          !setting.email.toLowerCase().includes(this.filterEmail.toLowerCase())
        )
          return false;

        if (
          this.filterPassword &&
          !setting.decrypted_password.toLowerCase().includes(this.filterPassword.toLowerCase())
        )
          return false;

        if (
          this.filterPhone &&
          setting.phone_number &&
          !setting.phone_number.toLowerCase().includes(this.filterPhone.toLowerCase())
        )
          return false;

        if (
          this.filterSMSReceived !== null &&
          setting.sms_received !== this.filterSMSReceived
        )
          return false;

        if (this.filterMain !== null && setting.main !== this.filterMain)
          return false;

        return true;
      });

      if (this.sortColumn) {
        filteredSettings.sort((a, b) => {
          let aValue = a[this.sortColumn];
          let bValue = b[this.sortColumn];

          if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            aValue = aValue ? 1 : 0;
            bValue = bValue ? 1 : 0;
          }

          if (aValue === undefined || aValue === null) aValue = '';
          if (bValue === undefined || bValue === null) bValue = '';

          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();

          if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return filteredSettings;
    },
  },

  methods: {
    clearFilters() {
      this.filterUserCode = '';
      this.filterSite = '';
      this.filterEmail = '';
      this.filterPassword = '';
      this.filterPhone = '';
      this.filterSMSReceived = null;
      this.filterMain = null;
    },

    sortData(column: string) {
      if (this.sortColumn === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortOrder = 'asc';
      }
    },

    async copyToClipboard(text: string) {
      try {
        await navigator.clipboard.writeText(text);
        this.notificationStore.add(NotificationType.Success, 'Copied to clipboard');
      } catch (e) {
        this.notificationStore.add(NotificationType.Error, 'Failed to copy to clipboard');
      }
    },

    async fetchUserAddress(user_code: string) {
      try {
        this.loadingAddress = true;
        const response = await axios.get('/api/platform/v1/profile', {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.authenticationStore.jwt
          },
          params: {
            user_code: user_code
          }
        });if (response.status === 200) {
          this.currentAddress = {
            user_code: user_code,
            address_line_1: response.data.address_line_1 || '',
            address_line_2: response.data.address_line_2 || '',
            address_city: response.data.address_city || '',
            address_state: response.data.address_state || '',
            address_zip: response.data.address_zip || '',
            country: response.data.country || ''
          };
          this.showAddressModal = true;
        }
      } catch (error) {
        this.notificationStore.add(NotificationType.Error, 'Failed to fetch address information');
        console.error('Error fetching address:', error);
      } finally {
        this.loadingAddress = false;
      }
    },

    closeAddressModal() {
      this.showAddressModal = false;
      this.currentAddress = null;
    },

    async checkLogin() {
      console.log('Checking login...');
      const passwordCorrect = await this.authenticationStore.checkCredentials(
        this.authenticationStore.userCode,
        this.loginPassword
      );

      if (!passwordCorrect) {
        this.notificationStore.add(NotificationType.Error, 'Invalid Password');
        return;
      }

      this.loginRequired = false;
      await this.fetchUserSettings();
    },

    async fetchUserSettings() {
      try {
        console.log('Fetching user settings...');
        const response = await axios.get('/user-settings/index');
        console.log('Raw response:', response.data);

        if (!response || response.status != 200) {
          this.notificationStore.add(NotificationType.Error, 'Could not load user settings');
          return;
        }

        this.userSettings = response.data;
        console.log('Processed user settings:', this.userSettings);
      } catch (e) {
        console.error('API Error:', e);
        this.notificationStore.add(NotificationType.Error, e as string);
      }
    },

    exportSelection() {
      let processRow = (row: any) => {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
          let innerValue = row[j] === null ? '' : row[j].toString();
          if (row[j] instanceof Date) innerValue = row[j].toLocaleString();
          let result = innerValue.replace(/"/g, '""');
          if (result.search(/([",\n])/g) >= 0) result = '"' + result + '"';
          if (j > 0) finalVal += ',';
          finalVal += result;
        }
        return finalVal + '\n';
      };

      let csvFile = processRow([
        'User Code',
        'Site',
        'Email',
        'Password',
        'Phone Number',
        'SMS Received',
        'Main',
      ]);
      for (const setting of this.visibleUserSettings) {
        csvFile += processRow([
          setting.user_code,
          setting.site,
          setting.email,
          setting.decrypted_password,
          setting.phone_number || 'Not Available',
          setting.sms_received ? 'Yes' : 'No',
          setting.main ? 'Yes' : 'No',
        ]);
      }

      const filename = 'user_settings_export.csv';

      let blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      if ((navigator as any).msSaveBlob) {
        (navigator as any).msSaveBlob(blob, filename);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },
  },

  async created() {
    console.log('Component created');
    await this.fetchUserSettings();
  },
});
</script>

<style scoped>
td {
  vertical-align: middle;
  overflow: hidden;
}

.th {
  cursor: pointer;
}

.cursor-pointer {
  cursor: pointer;
}

.truncate {
  max-width: 100%;
}

td span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-icon {
  cursor: pointer;
}

.settings-container {
  max-width: 1200px;
  margin: auto;
}
</style>