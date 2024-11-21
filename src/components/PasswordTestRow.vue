<template>
    <tr v-if="!isEditing">
      <td v-if="authenticationStore.userType == UserType.Admin" class="whitespace-nowrap w-24">{{ password.user_code }}</td>
      <td class="whitespace-nowrap w-32">{{ password.site }}</td>
      <td class="whitespace-nowrap w-64">
        <div class="flex justify-center gap-2">
          <span>{{ password.email }}</span>
          <button class="btn btn-square btn-xs ms-auto" @click="copyText(password.email)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
              <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
            </svg>
          </button>
        </div>
      </td>
      <td class="whitespace-nowrap w-96">
        <div class="flex justify-center gap-2">
          <span>{{ password.decrypted_password }}</span>
          <button class="btn btn-square btn-xs" @click="copyText(password.decrypted_password)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
              <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
            </svg>
          </button>
        </div>
      </td>
      <td class="whitespace-nowrap w-40">
        <div class="flex justify-center gap-2">
          <span>{{ password.phone_number || '-' }}</span>
          <button v-if="password.phone_number" class="btn btn-square btn-xs" @click="copyText(password.phone_number)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
              <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
            </svg>
          </button>
          <button class="btn btn-square btn-xs" @click="powerFunction">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.166 5.106a.75.75 0 0 1 0 1.06 8.25 8.25 0 1 0 11.668 0 .75.75 0 1 1 1.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
      <td class="whitespace-nowrap w-40">
        <div class="flex justify-center gap-2">
          <span>{{ password.slack_id || '-' }}</span>
          <button v-if="password.slack_id" class="btn btn-square btn-xs" @click="copyText(password.slack_id)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
              <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
            </svg>
          </button>
        </div>
      </td>
      <td class="w-20">
        <span v-if="password.main" class="badge badge-success">Yes</span>
        <span v-else class="badge badge-warning">No</span>
      </td>
      <td class="w-24">
        <div class="whitespace-nowrap flex flex-row gap-1">
          <button class="btn btn-xs btn-warning flex-grow" @click="startEdit()">Edit</button>
        </div>
      </td>
    </tr>
  
    <!-- Edit mode row remains the same but with added width classes -->
    <tr v-if="isEditing">
      <td v-if="authenticationStore.userType == UserType.Admin" class="w-24">
        <input type="text" class="input input-bordered input-xs w-full" v-model="tempPassword.user_code" />
      </td>
      <td class="w-32">
        <input type="text" class="input input-bordered input-xs w-full" v-model="tempPassword.site" />
      </td>
      <td class="w-64">
        <input type="text" class="input input-bordered input-xs w-full" v-model="tempPassword.email" />
      </td>
      <td class="w-96">
        <input type="text" class="input input-bordered input-xs w-full" v-model="tempPassword.decrypted_password" />
      </td>
      <td class="w-40">
        <input type="text" class="input input-bordered input-xs w-full" v-model="tempPassword.phone_number" />
      </td>
      <td class="w-40">
        <input type="text" class="input input-bordered input-xs w-full" v-model="tempPassword.slack_id" />
      </td>
      <td class="w-20">
        <input type="checkbox" class="toggle toggle-warning toggle-sm" v-model="tempPassword.main" />
      </td>
      <td class="w-24">
        <div class="whitespace-nowrap flex flex-row gap-1">
          <button class="btn btn-xs btn-success flex-grow" @click="saveEdit">Save</button>
          <button class="btn btn-xs btn-error flex-grow" @click="$emit('deletePassword', password)">Delete</button>
        </div>
      </td>
    </tr>
  </template>
  
  <script lang="ts">
  import {defineComponent, type PropType} from 'vue'
  import type PasswordTest from "@/model/PasswordTest";
  import {DefaultPasswordTest} from "@/model/PasswordTest";
  import {useAuthenticationStore} from "@/stores/AuthenticationStore";
  import {UserType} from "@/model/UserType";
  
  export default defineComponent({
    name: "PasswordTestRow",
    props: {
      password: {
        type: Object as PropType<PasswordTest>,
        required: true
      }
    },
    emits: ['deletePassword', 'editPassword'],
    data() {
      return {
        isEditing: false,
        tempPassword: DefaultPasswordTest()
      }
    },
    computed: {
      UserType() {
        return UserType
      },
      authenticationStore: () => useAuthenticationStore()
    },
    methods: {
      startEdit() {
        Object.assign(this.tempPassword, this.password);
        this.isEditing = true;
      },
  
      saveEdit() {
        this.$emit('editPassword', this.tempPassword, this.password);
        this.isEditing = false;
      },
  
      copyText(text: string) {
        navigator.clipboard.writeText(text);
      },
  
      powerFunction() {
        // To be implemented later
        console.log('Power function clicked');
      }
    }
  })
  </script>
  
  <style scoped>
  </style>