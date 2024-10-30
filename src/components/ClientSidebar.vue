<script lang="ts">
import {defineComponent} from 'vue'
import {useDataStore} from "@/stores/DataStore";
import {useSummaryStore} from "@/stores/SummaryStore";
import {useUserTipsStore} from "@/stores/UserTipsStore";
import {useLinksStore} from "@/stores/LinksStore";

export default defineComponent({
  name: "ClientSidebar",
  emits: ['selectTip', 'unlockEventClicked'],
  computed: {

    userTipsStore: () => useUserTipsStore(),
    summaryStore: () => useSummaryStore(),
    linksStore: () => useLinksStore(),
  }
})
</script>

<template>
  <div class="p-2 gap-2 flex flex-col">

    <div v-for="userTip in userTipsStore.sortedTips" :key="userTip.id" class="tooltip tooltip-right" :data-tip="userTip.content">
      <button @click="$emit('selectTip', userTip)" class="btn btn-xs btn-primary w-full whitespace-nowrap">
        {{ userTip.title }}
      </button>
    </div>
  </div>

  <div class="p-2 gap-2 flex flex-col py-10 mt-auto">
    <button v-for="linkSet in linksStore.linkSets" :key="linkSet.id" @click="linksStore.openSetModal(linkSet)"
            class="btn btn-xs btn-info w-full whitespace-nowrap">{{ linkSet.name }}
    </button>
  </div>

  <div class="p-2 gap-2 flex flex-col pb-10">
    <div>
      <p class="mb-3">
        <b>Total Predicted Cost</b>
        <br>Bought: {{ summaryStore.predictedCostTotals.bought.toFixed(2) }}
        <br>Pending: {{ summaryStore.predictedCostTotals.pending.toFixed(2) }}
        <br>Lost: {{ summaryStore.predictedCostTotals.lost.toFixed(2) }}
      </p>
    </div>
    <button @click="$emit('unlockEventClicked')" class="btn btn-xs btn-secondary w-full whitespace-nowrap">
      Unlock With Password
    </button>
    <router-link class="btn btn-xs btn-info w-full whitespace-nowrap" to="/passwords">List Passwords</router-link>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .tooltip[data-tip]::before {
    display: none !important;
  }
}
</style>