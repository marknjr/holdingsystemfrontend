<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type Admin from "@/model/Admin";

export default defineComponent({
  name: "AdminRow",
  props: {
    admin: {
      type: Object as PropType<Admin>,
      required: true
    }
  },

  emits: ['deleteAdmin', 'editAdmin'],

  data() {
    return {
      isEditing: false,
      tempAdmin: {
        id: 0,
        name: '',
        username: '',
        password: ''
      } as Admin,

    }
  },

  methods: {
    startEdit() {
      Object.assign(this.tempAdmin, this.admin);
      this.isEditing = true;
    },

    saveEdit() {
      this.$emit('editAdmin', this.tempAdmin, this.admin);
      this.isEditing = false;
    },
  }
})
</script>

<template>
  <tr v-if="!isEditing">
    <td class="whitespace-nowrap">{{ admin.name }}</td>
    <td class="whitespace-nowrap">{{ admin.username }}</td>
    <td class="whitespace-nowrap">*********</td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-warning flex-grow" @click="startEdit()">Edit</button>
      </div>
    </td>
  </tr>

  <tr v-if="isEditing">
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempAdmin.name" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempAdmin.username" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempAdmin.password" /></td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-success flex-grow" @click="saveEdit">Save</button>
        <button class="btn btn-xs btn-error flex-grow" @click="$emit('deleteAdmin', admin)">Delete</button>
      </div>
    </td>
  </tr>
</template>