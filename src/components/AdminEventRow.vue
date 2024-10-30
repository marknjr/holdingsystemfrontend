<script lang="ts">
import {defineComponent} from 'vue'
import {type PropType} from "vue";
import type BookingEvent from "@/model/BookingEvent";
import {WsMessageCode} from "@/model/WsMessage";
import {useDataStore} from "@/stores/DataStore";
import moment from "moment";
import {EmptyBookingEvent} from "@/model/BookingEvent";
import {useWebSocketsStore} from "@/stores/WebSocketsStore";
import {useLinksStore} from "@/stores/LinksStore";

export default defineComponent({
  name: "AdminEventRow",
  props: {
    bookingEvent: {
      type: Object as PropType<BookingEvent>,
      required: true
    }
  },

  emits: ['drag', 'drop', 'duplicate'],

  data() {
    return {
      isEditing: false,
      tempEvent: {...EmptyBookingEvent},

    }
  },

  computed: {

    webSocketsStore: () => useWebSocketsStore(),
    linksStore: () => useLinksStore(),

    moment() {
      return moment
    },
  },


  methods: {
    startEdit() {
      Object.assign(this.tempEvent, this.bookingEvent);
      this.isEditing = true;
    },

    saveEdit() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.EditBookingEvent,
        content: this.tempEvent
      })
      this.isEditing = false;
    },


    deleteEvent() {
      this.webSocketsStore.sendMessage({
        messageCode: WsMessageCode.DeleteBookingEvent,
        content: this.bookingEvent
      })
    }
  },

})
</script>

<template>
  <tr v-if="!isEditing" draggable="true" @drag="$emit('drag', bookingEvent)" @drop="$emit('drop', bookingEvent)" @dragover.prevent>
    <td class="whitespace-nowrap">{{ bookingEvent.waiting_room ? moment.utc(bookingEvent.waiting_room).format('DD/MM/YYYY HH:mm:ss') : '' }}</td>
    <td class="whitespace-nowrap">{{ bookingEvent.onsale_time ? moment.utc(bookingEvent.onsale_time).format('DD/MM/YYYY HH:mm:ss') : '' }}</td>
    <td class="whitespace-nowrap">{{ bookingEvent.name }}</td>
    <td class="whitespace-nowrap">{{ bookingEvent.arena }}</td>
    <td class="whitespace-nowrap">{{ bookingEvent.day }}</td>
    <td class="whitespace-nowrap">{{ moment.utc(bookingEvent.date).format('DD/MM/YYYY') }}</td>
    <td>{{ bookingEvent.filters }}</td>
    <td>{{ bookingEvent.expected_price }}</td>
    <td>{{ bookingEvent.limits }}</td>
    <td>{{bookingEvent.password}}</td>
    <td class="overflow-ellipsis overflow-hidden max-w-[130px]"><button class="btn btn-xs btn-warning flex-grow" @click="linksStore.openEventModal(bookingEvent)">Links</button></td>
    <td>
      <span v-if="bookingEvent.paused" class="badge badge-warning">Yes</span>
      <span v-else class="badge badge-success">No</span>
    </td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-warning flex-grow" @click="startEdit()">Edit</button>
        <button class="btn btn-xs btn-warning flex-grow" @click="$emit('duplicate', bookingEvent)">Duplicate</button>
      </div>
    </td>
  </tr>

  <tr v-if="isEditing">
    <td><input type="datetime-local" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.waiting_room"/></td>
    <td><input type="datetime-local" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.onsale_time"/></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.name" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.arena" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.day" /></td>
    <td><input type="date" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.date" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.filters" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.expected_price" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.limits" /></td>
    <td><input type="text" class="input input-bordered input-xs w-full max-w-xs" v-model="tempEvent.password" /></td>
    <td></td>
    <td><input type="checkbox" class="toggle toggle-warning toggle-sm" v-model="tempEvent.paused" /></td>
    <td>
      <div class="whitespace-nowrap flex flex-row gap-1">
        <button class="btn btn-xs btn-success flex-grow" @click="saveEdit">Save</button>
        <button class="btn btn-xs btn-error flex-grow" @click="deleteEvent">Delete</button>
      </div>
    </td>
  </tr>
</template>