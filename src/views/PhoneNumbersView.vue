<template>
  <page-wrapper>
    <!-- Admin View -->
    <div v-if="authenticationStore.userType == UserType.Admin" class="flex gap-4">
      <!-- Phone Numbers Management Panel -->
      <div class="w-1/3 bg-base-200 p-4 rounded-lg">
        <h2 class="text-lg font-bold mb-4">Phone Numbers Management</h2>
        <div class="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="Search numbers..." 
            class="input input-bordered input-sm w-full"
            v-model="filterPhoneNumber"
          />
        </div>
        <div class="overflow-y-auto max-h-[600px]">
          <div 
            v-for="number in visiblePhoneNumbers" 
            :key="number.id"
            :class="[
              'p-2 border-b cursor-pointer hover:bg-base-300',
              selectedNumber?.id === number.id ? 'bg-base-300' : ''
            ]"
            @click="selectNumber(number)"
          >
            <div class="font-medium">{{ number.phone_number }}</div>
            <div class="text-sm text-gray-500">
              {{ number.user_code || 'Unassigned' }} - {{ number.location }}
            </div>
            <div class="text-xs text-gray-400">
              Status: {{ number.status }}
            </div>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button 
            class="btn btn-sm btn-primary" 
            @click="showAssignModal"
            v-if="selectedNumber"
          >
            Assign Number
          </button>
          <button 
            class="btn btn-sm btn-warning"
            @click="showLocationModal"
            v-if="selectedNumber"
          >
            Update Location
          </button>
        </div>
      </div>

      <!-- Messages Display Panel -->
      <div class="flex-1 bg-base-200 p-4 rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">
            Messages
            <span v-if="selectedNumber">
              - {{ selectedNumber.phone_number }}
              ({{ selectedNumber.user_code || 'Unassigned' }})
            </span>
          </h2>
          <div class="flex gap-2">
            <button 
              class="btn btn-sm btn-ghost"
              @click="refreshMessages"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div class="overflow-y-auto max-h-[600px] space-y-4">
          <div 
            v-for="message in selectedNumberMessages" 
            :key="message.id"
            class="bg-white p-4 rounded-lg shadow"
          >
            <div class="flex justify-between items-start">
              <div class="text-sm text-gray-500">
                {{ formatDate(message.timestamp) }}
              </div>
              <div class="flex gap-2">
                <button 
                  class="btn btn-xs btn-ghost"
                  v-if="detectOTP(message.content)"
                  @click="copyOTP(message.content)"
                >
                  Copy OTP
                </button>
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="copyFullMessage(message.content)"
                >
                  Copy Full
                </button>
              </div>
            </div>
            <div class="mt-2 whitespace-pre-wrap">{{ message.content }}</div>
            <div v-if="detectOTP(message.content)" class="mt-2 bg-blue-100 p-2 rounded">
              <span class="font-mono text-lg">{{ extractOTP(message.content) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User View -->
    <div v-else class="max-w-3xl mx-auto">
      <div class="bg-base-200 p-4 rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Your SMS Messages</h2>
          <button 
            class="btn btn-sm btn-ghost"
            @click="refreshMessages"
          >
            Refresh
          </button>
        </div>

        <div class="space-y-4">
          <div 
            v-for="message in userMessages" 
            :key="message.id"
            class="bg-white p-4 rounded-lg shadow"
          >
            <div class="flex justify-between items-start">
              <div class="font-medium">
                From: {{ message.phone_number }}
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(message.timestamp) }}
              </div>
            </div>
            
            <!-- Highlighted OTP Section if detected -->
            <div v-if="detectOTP(message.content)" class="mt-2 bg-blue-100 p-3 rounded flex justify-between items-center">
              <span class="font-mono text-xl">{{ extractOTP(message.content) }}</span>
              <button 
                class="btn btn-sm btn-primary"
                @click="copyOTP(message.content)"
              >
                Copy Code
              </button>
            </div>

            <!-- Full Message -->
            <div class="mt-2 text-gray-600 whitespace-pre-wrap">
              {{ message.content }}
            </div>
            
            <div class="mt-2 flex justify-end">
              <button 
                class="btn btn-xs btn-ghost"
                @click="copyFullMessage(message.content)"
              >
                Copy Full Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Assign Number Modal -->
    <dialog ref="assignModal" class="modal">
      <!-- Modal content -->
    </dialog>

    <!-- Location Update Modal -->
    <dialog ref="locationModal" class="modal">
      <!-- Modal content -->
    </dialog>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageWrapper from "@/components/PageWrapper.vue";
import { useAuthenticationStore } from "@/stores/AuthenticationStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { NotificationType } from "@/model/UserNotification";
import { UserType } from "@/model/UserType";
import axios from 'axios';
import moment from 'moment';

interface PhoneNumber {
  id: number;
  phone_number: string;
  user_code: string;
  status: string;
  assigned_at: string;
  location: string;
  last_updated: string;
}

interface SMSMessage {
  id: number;
  phone_number: string;
  content: string;
  timestamp: string;
}

export default defineComponent({
  name: 'PhoneNumbersView',
  components: { PageWrapper },

  data() {
    return {
      phoneNumbers: [] as PhoneNumber[],
      messages: [] as SMSMessage[],
      selectedNumber: null as PhoneNumber | null,
      filterPhoneNumber: '',
      assignForm: {
        user_code: ''
      },
      locationForm: {
        location: ''
      }
    }
  },

  computed: {
    authenticationStore: () => useAuthenticationStore(),
    notificationStore: () => useNotificationStore(),
    UserType() {
      return UserType;
    },

    visiblePhoneNumbers(): PhoneNumber[] {
      return this.phoneNumbers.filter(number => 
        (!this.filterPhoneNumber || number.phone_number.includes(this.filterPhoneNumber))
      );
    },

    selectedNumberMessages(): SMSMessage[] {
      if (!this.selectedNumber) return [];
      return this.messages.filter(m => m.phone_number === this.selectedNumber.phone_number);
    },

    userMessages(): SMSMessage[] {
      return this.messages.filter(m => {
        const phoneNumber = this.phoneNumbers.find(p => p.phone_number === m.phone_number);
        return phoneNumber?.user_code === this.authenticationStore.userCode;
      });
    }
  },

  methods: {
    formatDate(date: string) {
      return moment(date).format('DD/MM/YYYY HH:mm:ss');
    },

    detectOTP(content: string): boolean {
      return /\b\d{4,6}\b/.test(content);
    },

    extractOTP(content: string): string {
      const match = content.match(/\b\d{4,6}\b/);
      return match ? match[0] : '';
    },

    copyOTP(content: string) {
      const otp = this.extractOTP(content);
      navigator.clipboard.writeText(otp);
      this.notificationStore.add(NotificationType.Success, 'Code copied to clipboard');
    },

    copyFullMessage(content: string) {
      navigator.clipboard.writeText(content);
      this.notificationStore.add(NotificationType.Success, 'Message copied to clipboard');
    },

    async refreshMessages() {
      try {
        const response = await axios.get('/messages'); // Adjust the endpoint as needed
        if (response.status === 200) {
          this.messages = response.data.messages;
        }
      } catch (e) {
        this.notificationStore.add(NotificationType.Error, 'Failed to refresh messages');
      }
    },

    selectNumber(number: PhoneNumber) {
      this.selectedNumber = number;
      this.refreshMessages();
    },

    async showAssignModal() {
      (this.$refs.assignModal as HTMLDialogElement).showModal();
    },

    async showLocationModal() {
      (this.$refs.locationModal as HTMLDialogElement).showModal();
    }
  },

  async created() {
    try {
      const response = await axios.get('/phone-numbers/index');
      if (response.status === 200) {
        this.phoneNumbers = response.data.phoneNumbers;
      }
    } catch (e) {
      this.notificationStore.add(NotificationType.Error, 'Could not load phone numbers');
    }
  }
});
</script>

<style scoped>
.modal {
  backdrop-filter: blur(4px);
}
</style>
