<script lang="ts">
import {defineComponent} from 'vue'
import {useLinksStore} from "@/stores/LinksStore";
import {DefaultLink} from "@/model/Link";
import {WsMessageCode} from "@/model/WsMessage";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import AdminLinkRow from "@/components/AdminLinkRow.vue";

export default defineComponent({
  name: "EventLinksModal",
  components: {AdminLinkRow},
  data() {
    return {
      tempLink: DefaultLink(),

    }
  },
  computed: {
    linksStore: () => useLinksStore(),
    webSocketsStore: () => useWebSocketsStore(),
    submitValidation() {
      return {
        name: !!this.tempLink.name,
        url: !!this.tempLink.url,
        set: !!this.tempLink.link_set_name
      } as any
    },
  },
  methods: {
    createLink() {

      for(const validation in this.submitValidation)
        if(!this.submitValidation[validation])
          return;
      this.tempLink.booking_event_id = this.linksStore.eventsLinkModalData?.id ?? 0;
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.AddLink,
        content: this.tempLink
      });
      this.resetFields();
    },

    resetFields() {
      this.tempLink = DefaultLink();
    },
  }
})
</script>

<template>

  <datalist id="linkSetOptions">
    <option v-for="linkSet in linksStore.linkSets" :key="linkSet.id" :value="linkSet.name">{{ linkSet.name }}</option>
  </datalist>
  <input type="checkbox" id="eventLinksModalOpen" v-model="linksStore.eventsLinkModalOpen" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box" style="max-width: 90%; width: unset;">
      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="linksStore.eventsLinkModalOpen = false">✕
      </button>
      <h3 class="font-bold text-lg mx-auto text-center px-10">Event Links</h3>

      <table class="table table-xs table-pin-rows z-0">
        <thead class="table-md">
        <tr>
          <th>Name</th>
          <th>URL</th>
          <th>Link Set</th>
          <th class="w-[150px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr class="bg-blue-200">
          <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.name ? '' : ' input-error')" v-model="tempLink.name" /></td>
          <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.url ? '' : ' input-error')" v-model="tempLink.url" /></td>
          <td><input type="text" :class="'input input-bordered input-xs w-full max-w-xs' + (submitValidation.set ? '' : ' input-error')" v-model="tempLink.link_set_name" list="linkSetOptions" /></td>
          <td>
            <button class="btn btn-xs btn-warning w-full" @click="createLink()">Submit</button>
          </td>
        </tr>
        <admin-link-row v-for="link in linksStore.eventsLinkModalData?.links" :key="link.id" :link="link"/>
        </tbody>
      </table>

    </div>
  </div>
</template>

<style scoped>

</style>