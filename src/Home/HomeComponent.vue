<script setup lang="ts">
import { Observer } from 'mobx-vue-lite'
import NavigationComponent from '../Navigation/NavigationComponent.vue'
import { container } from '../AppIOC'
import { AppPresenter } from "@/AppPresenter.ts";

const app = container.get(AppPresenter)
</script>
<template>
  <vue-dd v-model="app" />
  <Observer>
    <div class="w3-row">
      <div class="w3-col s4 w3-center">
        <NavigationComponent />
      </div>
<!--      <div class="w3-col s8 w3-left" v-for="current in renderedComponents">-->
<!--        <component v-if="presenter.currentRoute.routeId === current.id" :is="current.component" />-->
<!--      </div>-->
      <div class="w3-col s8 w3-left">
        <router-view />
      </div>
    </div>
  </Observer>
</template>