<script setup lang="ts">
// import { Observer, useLocalObservable } from 'mobx-vue-lite'
import { reaction } from 'mobx'
import { LoginRegisterPresenter } from './LoginRegisterPresenter'
import MessagesComponent from '../Core/Messages/MessagesComponent.vue'
// import { useValidation } from '../Core/Providers/Validation'
import { container } from '../AppIOC'
import { reactive, shallowRef, ref, triggerRef, markRaw, getCurrentInstance } from "vue";
import { AuthenticationRepository } from "@/Authentication/AuthenticationRepository.js";

import isArrow from 'isarrow'
function formValid () {
  return true
}
console.log(isArrow("hello world")); // > false
console.log(isArrow(function() {})); // > false
console.log(isArrow(async function() {})); // > false
console.log(isArrow(class {})); // > false
console.log(isArrow(() => {})); // > true
console.log(isArrow(async () => {})); // > true
console.log(isArrow(123)); // > false
console.log(isArrow({})); // > false
console.log(isArrow([])); // > false
console.log(isArrow(Math.min)); // > false
const presenter: LoginRegisterPresenter = container.get(LoginRegisterPresenter);
const vm: LoginRegisterPresenter = presenter.getVm()
console.log('presenter', presenter)
console.log('vm', vm)
// const vm: LoginRegisterPresenter = presenter.getVm();
// console.log('vm', vm)
const auth = container.get(AuthenticationRepository);

</script>
<template>

  <!--  <vue-dd name="p" v-model="p" />-->
  <!--  <vue-dd name="presenter" v-model="presenter" />-->
  <!--  <vue-dd name="state" v-model="state" />-->
  <!--  <vue-dd name="refObj" v-model="refObj" />-->
<!--  <vue-dd name="presenter" :get-all-properties="true" v-model="presenter" />-->
  <vue-dd name="vm" :get-all-properties="true" v-model="vm" />

  <div class="container">
    <div class="login-register">
      <div class="w3-row">
        <div class="w3-col s4 w3-center">
          <br />
        </div>
        <div class="w3-col s4 w3-center logo">
          <img alt="logo"
               src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/themes/2147767979/settings_images/iE7LayVvSHeoYcZWO4Dq_web-logo-pink-light-bg3x.png"
               style="width: 160px; filter: grayscale(100%);">
        </div>

        <div class="w3-col s4 w3-center">

        </div>
      </div>
    </div>

    <!--  <Observer>-->
    <div v-for="element in vm.viewTest">
      <input type="text" v-model="element.test1" /> {{ element.sub.test }}
    </div>
    <!--  </Observer>-->

<!--    <Observer2 :state="vm">-->
<!--      <input type="hidden" :value="vm" />-->
<!--      <input type="text" v-model="presenter.password.test.rest" />-->
<!--      {{ presenter.password.test.rest}}-->
<!--    </Observer2>-->

{{vm.password.test.rest}}
<!--    <Observer>-->
<!--      <div v-for="element in presenter.viewTest">-->
<!--        <input type="text" v-model="element.test1" /> {{ element.sub.test }}-->
<!--      </div>-->
<!--    </Observer>-->

    <button @click="() => { vm.viewTest = [{ test1: 'hola', sub:{test:11} }] }">Set value</button>

    <button @click="() => { vm.setAuthRepoTest() }">Set value push</button>
    <button @click="() => { vm.setTest3() }">Set value 3</button>
    <button @click="() => { vm.setTest4() }">Set value 4</button>
    <button @click="() => { vm.viewTest[0].sub.test = 1 }">Set value 5</button>
    <button @click="() => { vm.setTest6() }">Set value 6</button>
    <button @click="() => { presenter.email = 'eka@eka.ca' }">Set value 7</button>
    <button @click="() => { vm.setTest8() }">Set value 8</button>

    <br />
    <br />
    <button @click="() => { presenter.email = 'test' }">Set Presenter email</button>

    <div>
      <div class="w3-row">
        <div class="w3-col s4 w3-center">
          <br />
        </div>
        <div class="w3-col s4 w3-center option">
          <input
            class="lr-submit"
            :style="{ backgroundColor: '#e4257d' }"
            type="submit"
            value="login"
            @click.prevent="() => vm.option = 'login'"
          />
          <input
            class="lr-submit"
            :style="{ backgroundColor: '#2E91FC' }"
            type="submit"
            value="register"
            @click.prevent="() => {
              vm.option = 'register'
            }"
          />
        </div>
        <div class="w3-col s4 w3-center">
          <br />
        </div>
      </div>
      <div
        class="w3-row"
        :style="{
        backgroundColor: vm.option === 'login' ? '#E4257D' : '#2E91FC',
        height: '100px',
        paddingTop: '20px',
      }"
      >
        <form
          class="login"
          @submit.prevent="(event) => {
          // event.preventDefault()
          if (formValid()) {
            if (vm.option === 'login') vm.login()
            if (vm.option === 'register') vm.register()
          }
        }"
        >
          <div class="w3-col s4 w3-center">
            <input
              type="text"
              v-model="vm.email"
              placeholder="Email"
            />
            <!--              @input="(event) => presenter.email = event.target.value"-->
          </div>
          <div class="w3-col s4 w3-center">

            <input
              type="text"
              v-model="vm.password"
              placeholder="Password"
            />
          </div>
          <div class="w3-col s4 w3-center">
            <input type="submit" class="lr-submit" :value="vm.option" />
          </div>

          <br />
        </form>
      </div>
      <MessagesComponent />
    </div>
  </div>
</template>
