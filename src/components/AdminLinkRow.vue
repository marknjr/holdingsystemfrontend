<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type Link from "@/model/Link";
import  {DefaultLink} from "@/model/Link";
import {WsMessageCode} from "@/model/WsMessage";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useLinksStore} from "@/stores/LinksStore";

export default defineComponent({
  name: "AdminLinkRow",
  props: {
    link: {
      type: Object as PropType<Link>,
      required: true
    }
  },
  data() {
    return {
      isEditing: false,
      tempLink: DefaultLink(),
    }
  },
  computed: {
    webSocketsStore: () => useWebSocketsStore(),
    linksStore: () => useLinksStore()
  },
  methods: {
    startEdit() {
      Object.assign(this.tempLink, this.link);
      this.isEditing = true;
    },
    saveEdit() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.EditLink,
        content: this.tempLink
      })
      this.isEditing = false;
    },


    deleteEvent() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.DeleteLink,
        content: this.tempLink
      })
    }
  }
})
</script>

<template>
  <tr v-if="!isEditing" draggable="true" @drag="linksStore.dragLink(link)" @drop="linksStore.dropLink(link)" @dragover.prevent>
    <td class="whitespace-nowrap">{{ link.name }}</td>
    <td class="">{{ link.url }}</td>
    <td class="whitespace-nowrap">{{ link.link_set_name }}</td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-warning flex-grow" @click="startEdit()">Edit</button>
      </div>
    </td>
  </tr>

  <tr v-if="isEditing">
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempLink.name" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempLink.url" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempLink.link_set_name" list="linkSetOptions" /></td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-success flex-grow" @click="saveEdit">Save</button>
        <button class="btn btn-xs btn-error flex-grow" @click="deleteEvent">Delete</button>
      </div>
    </td>
  </tr>
</template>

<style scoped>

</style>