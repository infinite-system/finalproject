import './assets/main.css'
import 'reflect-metadata'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { injectable } from 'inversify'

@injectable()
export class AppPresenter {
  constructor () {}
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
