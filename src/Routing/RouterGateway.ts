import { injectable } from 'inversify'
import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'

@injectable()
export class RouterGateway {

  vueRouter: Router

  registerRoutes = async (routeConfig, updateCurrentRoute) => {

    if (this.vueRouter) {
      return new Promise((resolve) => setTimeout(resolve, 0))
    }

    this.vueRouter = createRouter({
      history: createWebHistory(),
      routes: routeConfig
    })

    this.vueRouter.beforeEach(async to => {
      return await updateCurrentRoute(to.name)
    })

    console.log('vueRouter', this.vueRouter)

    return new Promise((resolve) => setTimeout(resolve, 0))
  }

  unload = () => {
    this.vueRouter = null
  }

  goToId = async (name, queryString = {}) => {
    console.log('name', name)
    return await this.vueRouter.push({ name: name, query: queryString })
  }
}
