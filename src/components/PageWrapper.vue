<script lang="ts">
import {defineComponent} from 'vue'
import {useAuthenticationStore} from "@/stores/AuthenticationStore";
import {useDataStore} from "@/stores/DataStore";
import {UserType} from "@/model/UserType";
import {useNotificationStore} from "@/stores/NotificationStore";
import AdminSidebar from "@/components/AdminSidebar.vue";
import ClientSidebar from "@/components/ClientSidebar.vue";
import TermsModal from "@/components/TermsModal.vue";
import TipEditorModal from "@/components/TipEditorModal.vue";
import EventUnlockModal from "@/components/EventUnlockModal.vue";
import EventLinksModal from "@/components/EventLinksModal.vue";
import ResetAppModal from "@/components/ResetAppModal.vue";
import FooterSummary from "@/components/FooterSummary.vue";
import ConnectionErrorModal from "@/components/ConnectionErrorModal.vue";
import {useSummaryStore} from "@/stores/SummaryStore";
import type UserTip from "@/model/UserTip";
import LinkSetModal from "@/components/LinkSetModal.vue";
import CommentsModal from "@/components/CommentsModal.vue";


export default defineComponent({
  name: "PageWrapper",
  components: {
    CommentsModal,
    LinkSetModal,
    ConnectionErrorModal,
    FooterSummary,
    ResetAppModal, EventLinksModal, EventUnlockModal, TipEditorModal, TermsModal, ClientSidebar, AdminSidebar
  },


  data() {
    return {
      shownTip: null as UserTip | null,
      showMenu: true as boolean,
    }
  },

  computed: {
    tipEditorModal(): InstanceType<typeof TipEditorModal> {
      return this.$refs.tipEditorComponent as InstanceType<typeof TipEditorModal>
    },

    resetAppModal(): InstanceType<typeof ResetAppModal> {
      return this.$refs.resetAppComponent as InstanceType<typeof ResetAppModal>
    },

    unlockModal(): InstanceType<typeof EventUnlockModal> {
      return this.$refs.eventUnlockComponent as InstanceType<typeof EventUnlockModal>
    },

    UserType() {
      return UserType
    },
    authenticationStore() {
      return useAuthenticationStore();
    },

    dataStore() {
      return useDataStore();
    },

    notificationStore() {
      return useNotificationStore();
    },
    summaryStore() {
      return useSummaryStore();
    }
  },

})
</script>

<template>
  <link-set-modal/>
  <comments-modal/>
  <template v-if="authenticationStore.userType == UserType.Admin">
    <tip-editor-modal ref="tipEditorComponent"/>
    <reset-app-modal ref="resetAppComponent"/>
    <event-links-modal/>
  </template>
  <template v-else>
    <terms-modal v-if="authenticationStore.userType == UserType.Client"/>
    <event-unlock-modal ref="eventUnlockComponent"/>
  </template>
  <connection-error-modal/>
  <div class="h-full w-screen flex flex-col">
    <div
        :class="'bg-base-200 border-b-2 border-gray-300 py-2 px-3 flex justify-between ' + ($route.name == 'submissions' ? 'bg-success' : '')">
      <div class="flex items-center gap-2">

        <label for="menu-drawer" class="drawer-button btn btn-square btn-sm btn-active">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
          </svg>
        </label>
        <p><b class="whitespace-nowrap">TT Advice Portal</b> <span class="whitespace-nowrap">| {{ $route.meta.title }}</span></p>
      </div>


      <div class="flex flex-row text-right">
        <p tabindex="0">User Code: <b>{{ authenticationStore.userCode }}</b></p>
        <button @click="authenticationStore.logout()"
                class="btn btn-error btn-ghost btn-xs ms-2 px-0.5 py-0 text-error">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
          </svg>
        </button>
      </div>
    </div>

    <div :class="'drawer overflow-hidden h-full ' + (showMenu ? 'lg:drawer-open' : '')">
      <input id="menu-drawer" type="checkbox" class="drawer-toggle" v-model="showMenu"/>

      <div class="drawer-side absolute h-full z-10" :style="authenticationStore.userType == UserType.Client ? 'overflow: visible!important;' : ''">
        <label for="menu-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <div class="h-full w-full grid" style="grid: 'a b' auto 'a c' 1fr / auto 1fr">
          <div class="min-h-full bg-base-200 text-base-content border-e-2 border-gray-300 flex flex-col justify-between" style="grid-area: a">
            <admin-sidebar v-if="authenticationStore.userType == UserType.Admin" @open-edit-tip="(tip) => tipEditorModal.openTip(tip)" @reset-app-clicked="() => {resetAppModal.openModal()}"/>
            <client-sidebar v-else @select-tip="(tip) => {shownTip = tip}" @unlock-event-clicked="() => {unlockModal.openModal()}"/>
          </div>
          <div class="p-4 lg:hidden" style="grid-area: b">
            <div v-if="shownTip" class="card w-full bg-base-100 shadow-xl lg:hidden">
              <div class="card-body">
                <h2 class="card-title">{{ shownTip.title }}</h2>
                <p>{{ shownTip.content }}</p>
              </div>
            </div>

            <label for="menu-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
          </div>
          <label for="menu-drawer" style="grid-area: c"></label>
        </div>


      </div>
      <div class="drawer-content overflow-hidden">
        <div class="grid h-full" style="grid-template-rows: 1fr auto auto">
          <div class="row-span-1 overflow-auto">
            <slot/>
          </div>
          <div class="row-span-1 p-2 lg:border-t-2 border-gray-300 lg:p-0">
            <footer-summary/>
          </div>
          <div class="w-full lg:hidden flex px-2 pb-2 gap-2 row-span-1">
            <label for="menu-drawer" class="btn btn-primary drawer-button flex-grow">Notes</label>
            <button @click="summaryStore.showSummary = !summaryStore.showSummary" class="btn flex-grow">Summary</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
