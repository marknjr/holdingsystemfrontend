<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type Password from "@/model/Password";
import {DefaultPassword} from "@/model/Password";
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {UserType} from "@/model/UserType";

export default defineComponent({
  name: "PasswordRow",
  props: {
    password: {
      type: Object as PropType<Password>,
      required: true
    }
  },
  emits: ['deletePassword', 'editPassword'],
  data() {
    return {
      isEditing: false,
      tempPassword: DefaultPassword()
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
    }
  }
})
</script>

<template>
  <tr v-if="!isEditing">
    <td v-if="authenticationStore.userType == UserType.Admin" class="whitespace-nowrap">{{ password.user_code }}</td>
    <td class="whitespace-nowrap">{{ password.site }}</td>
    <td class="whitespace-nowrap">
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
    <td class="whitespace-nowrap">
      <div class="flex justify-center gap-2">
        <span>{{ password.decrypted_password }}</span>

        <button class="btn btn-square btn-xs ms-auto" @click="copyText(password.decrypted_password)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
            <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
          </svg>
        </button>
      </div>
    </td>
    <td>
      <span v-if="password.main" class="badge badge-success">Yes</span>
      <span v-else class="badge badge-warning">No</span>
    </td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-warning flex-grow" @click="startEdit()">Edit</button>
      </div>
    </td>
  </tr>

  <tr v-if="isEditing">
    <td v-if="authenticationStore.userType == UserType.Admin"><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempPassword.user_code" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempPassword.site" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempPassword.email" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempPassword.decrypted_password" /></td>
    <td><input type="checkbox" class="toggle toggle-warning toggle-sm" v-model="tempPassword.main" /></td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-success flex-grow" @click="saveEdit">Save</button>
        <button class="btn btn-xs btn-error flex-grow" @click="$emit('deletePassword', password)">Delete</button>
      </div>
    </td>
  </tr>
</template>

<style scoped>

</style>