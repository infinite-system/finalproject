import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'inversify'
import { Types } from '../Core/Types'
import { RouterGateway } from "@/Routing/RouterGateway.js";

@injectable()
export class RouterRepository {

  @inject(Types.IRouterGateway) routerGateway: RouterGateway

  currentRoute = { routeId: null }

  onRouteChanged = null

  routes = [
    {
      routeId: null,
      routeDef: {
        path: '',
        isSecure: true,
        component: () => import('@/AppComponent.vue'),
        children: [
          {
            routeId: 'default',
            routeDef: {
              path: '/',
              isSecure: true,
              component: () => import('@/Home/HomeComponent.vue'),
            },
          },
          {
            routeId: 'loginLink',
            routeDef: {
              path: '/app/login',
              isSecure: false,
              component: () => import('@/Authentication/LoginRegisterComponent.vue'),
            }
          },
          {
            routeId: 'homeLink',
            routeDef: {
              path: '/app/home',
              isSecure: true,
              component: () => import('@/Home/HomeComponent.vue'),
            }
          },
        ]
      },
      onEnter: () => {}
    },
  ]

  flatRoutes = {}

  constructor () {
    makeObservable(this, {
      currentRoute: observable,
    })
  }

  flattenRoutes (routes, flatRoutes = {}) {
    routes.forEach(route => {
      flatRoutes[route.routeId] = route
      if ('children' in route.routeDef) {
        this.flattenRoutes(route.routeDef.children, flatRoutes)
      }
    })
    return flatRoutes
  }

  configureRoutes = (routes) => {

    const routeConfig = []

    routes.forEach(routeArg => {
      // console.log('routeArg', routeArg)
      const route = this.findRoute(routeArg.routeId)

      const routeId = routeArg.routeId;

      const routeDefinition = {
        name: route.routeId,
        path: route.routeDef.path,
        component: route.routeDef.component
      }

      if ('children' in route.routeDef) {
        routeDefinition.children = this.configureRoutes(route.routeDef.children)
      }

      routeConfig.push(routeDefinition)
    })

    return routeConfig
  }

  registerRoutes = (updateCurrentRoute, onRouteChanged) => {

    this.onRouteChanged = onRouteChanged

    this.flatRoutes = this.flattenRoutes(this.routes)
    console.log('this.flatRoutes', this.flatRoutes)

    const routeConfig = this.configureRoutes(this.routes)
    console.log('routeConfig', routeConfig)

    this.routerGateway.registerRoutes(routeConfig, updateCurrentRoute)
  }

  findRoute = (routeId) => {
    return routeId in this.flatRoutes
      ? this.flatRoutes[routeId]
      : { routeId: 'loadingSpinner', routeDef: { path: '' } }
  }

  goToId = async (routeId, params, query) => {
    console.log('go to routeId', routeId)
    return this.routerGateway.goToId(routeId)
  }
}
