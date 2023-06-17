import 'reflect-metadata'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './styles.css'
import AppComponent from './AppComponent.vue'
import { container } from './AppIOC'
import { configure } from 'mobx'
import { Types } from "@/Core/Types.js";
import { RouterGateway } from "@/Routing/RouterGateway.ts";
import { AppPresenter } from "@/AppPresenter.ts";
import { VueDd } from 'vue-dd'

const routerGateway: RouterGateway = container.get(Types.IRouterGateway)
const appPresenter: AppPresenter = container.get(AppPresenter)

appPresenter.load()

configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: false,
})


const app = createApp(AppComponent)

app.use(createPinia())
app.use(routerGateway.vueRouter)
app.component('VueDd', VueDd)

app.mount('#app')
