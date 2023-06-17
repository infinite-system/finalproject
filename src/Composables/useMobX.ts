import { markRaw, reactive, watch, UnwrapNestedRefs, toRaw } from "vue";
import { tryOnScopeDispose } from '@vueuse/core'

import { observable, reaction, makeObservable } from 'mobx'
import type { AnnotationsMap } from 'mobx'

/**
 * Create a shallow object clone very quickly.
 *
 * @param obj
 */
export function shallowClone (obj) {
  if (obj === null || typeof obj !== 'object' || '__isActiveClone__' in obj) {
    return obj;
  }
  let cloned = obj instanceof Date ? new Date(obj) : obj.constructor();
  return Array.isArray(obj) ? obj.slice(0) : Object.assign(cloned, obj)
}

/**
 * Notify MobX reactivity system of changes to propagate Vue reactive changes, by reassigning values.
 *
 * @param obj
 * @param prop
 * @param key
 */
export function notify (obj, prop, key = null) {
  return key !== null
    ? obj[prop][key] = shallowClone(obj[prop][key])
    : obj[prop] = shallowClone(obj[prop])
}

/**
 * Very quick full clone function.
 *
 * @param obj
 */
export function fullClone (obj) {

  if (obj === null || typeof obj !== 'object' || '__isActiveClone__' in obj) {
    return obj;
  }

  let cloned = obj instanceof Date ? new Date(obj) : obj.constructor();

  if (Array.isArray(obj)) {
    const objLength = obj.length;
    for (let key = 0; key < objLength; key++) {
      cloned[key] = fullClone(obj[key]);
    }
  } else {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj['__isActiveClone__'] = null;
        cloned[key] = fullClone(obj[key]);
        delete obj['__isActiveClone__'];
      }
    }
  }

  return cloned;
}

/**
 * Get setters and getters of a class instance.
 * Also gets all magic methods (getters and setters) stored in 'all' param.
 *
 * @param instance
 * @return { get: [...], set: [...], all: [...] }
 */
function getMagicProps (instance) {

  const props = Object.entries(
    Object.getOwnPropertyDescriptors(
      Reflect.getPrototypeOf(instance)
    )
  )

  const magicProps = { get: {}, set: {}, all: {} }

  for (let i = 0; i < props.length; i++) {
    if (props[i][0] !== '__proto__') {
      if (typeof props[i][1].get === 'function') {
        // getters
        magicProps.get[props[i][0]] = true
        magicProps.all[props[i][0]] = true
      }
      if (typeof props[i][1].set === 'function') {
        // setters
        magicProps.set[props[i][0]] = true
        magicProps.all[props[i][0]] = true
      }
    }
  }

  return magicProps
}

/**
 * Setup MobX observable and Vue Reactive state on an object.
 *
 * @param observers
 * @param raw
 * @param annotations
 */
export function reactiveObservable<TStore extends Record<string, any>> (
  observers: Object<any> = {},
  raw: Array<any> = [],
  annotations?: AnnotationsMap<TStore, never>,
): UnwrapNestedRefs<TStore> {

  const obj = observable(observers, annotations, { autoBind: true })

  if (Array.isArray(raw)) {
    raw.forEach(prop => {
      if (typeof obj[prop] === 'object') {
        if (Array.isArray(obj[prop])) {
          obj[prop] = obj[prop].map(el => markRaw(el))
        } else {
          obj[prop] = markRaw(obj[prop])
        }
      }
    })
  } else if (raw === true) {
    for (const prop in observers) {
      if (typeof observers[prop] === 'object') {
        if (Array.isArray(obj[prop])) {
          obj[prop] = obj[prop].map(el => typeof el === 'object' ? markRaw(el) : el)
        } else {
          obj[prop] = markRaw(obj[prop])
        }
      }
    }
  }

  return reactive(obj)
}

/**
 * Create shadow prop name.
 *
 * @param prop
 */
export function shadowProp (prop): string {
  return '__' + prop
}

/**
 * Create a Vue reactive object that is a shadow of MobX state.
 *
 * @param obj
 * @param observables
 * @param options
 */
export function useMobX (obj, observables, options = {}) {

  // Init options
  const opts = {
    ...{
      raw: false, // true for all observables or [] of items that must be markRaw()
      attach: 'vm', // property name to attach to obj
      annotations: {}
    },
    ...options
  }

  // If singleton is already instantiated
  // return state property
  if (opts.attach && shadowProp(opts.attach) in obj) {
    return obj[shadowProp(opts.attach)]
  }

  // Get all the magic setters and getters from the object
  const magicProps = getMagicProps(obj)

  // Collect all observable definitions
  const observers = {}
  for (const observable in observables) {
    observers[observable] = typeof obj[observable] === 'function'
      ? obj[observable].bind(obj)
      : fullClone(obj[observable])
  }

  // Setup the base combined MobX observable and Vue reactive state
  const state = reactiveObservable(observers, opts.raw, opts.annotations)

  // Create a raw map for fast access
  const rawMap = {}
  if (Array.isArray(opts.raw)) {
    opts.raw.forEach(prop => rawMap[prop] = true)
  }

  // Determine if property should be watched by Vue.
  // Getters, setters, computed and functions
  // should not be watched by Vue, because
  // those values cannot be re-assigned
  function shouldWatch (obj, magicProps, observables, observable) {
    return typeof magicProps.get[observable] !== 'undefined' || typeof obj[observable] !== 'function'
  }

  // Get all the props from the source object
  const allProps = Object.getOwnPropertyNames(obj)
    .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)));

  // Create shadow of all the props that are not observables
  allProps.forEach(prop => {
    if (typeof observables[prop] === 'undefined' && prop !== opts.attach && prop !== shadowProp(opts.attach)) {
      state[prop] = typeof obj[prop] === 'object'
        ? markRaw(obj[prop])
        : (typeof obj[prop] === 'function'
            ? obj[prop].bind(obj)
            : obj[prop]
        )
    }
  })

  // MobX reactions
  const createReaction = {}
  // MobX reaction disposers
  const reactionDisposer = {}

  // Vue watchers
  const createWatcher = {}
  // Vue watch disposers
  const watcherDisposer = {}

  // Iterate over all the defined observables
  for (let observable in observables) {

    if (shouldWatch(obj, magicProps, observables, observable)) {

      // Create a Vue Watcher to set values on the original MobX observable object
      // Watches the values change in the Vue shadow state and sets
      // them back to the MobX observable
      createWatcher[observable] = () => {

        return watch(() => state[observable], newValue => {

          if (observable in reactionDisposer) {
            // Dispose the MobX reaction before setting value
            // to prevent infinite reactive recursion
            reactionDisposer[observable]()
          }

          // Set the value of the original object property
          // Set to raw object instead of reactive() object
          // By calling toRaw() on the new value
          obj[observable] = toRaw(newValue)

          // Recreate MobX reaction and its disposer function after setting a new value
          if (observable in createReaction) {
            reactionDisposer[observable] = createReaction[observable]()
          }

        }, { deep: true })
      }

      // Create MobX reaction and store the reaction disposer
      watcherDisposer[observable] = createWatcher[observable]()

      // Create MobX reactions that will change the Vue shadow state reactive() props
      createReaction[observable] = () => {

        return reaction(() => obj[observable], newValue => {

          // Dispose the Vue watcher before setting a value.
          // This is to prevent infinite recursion
          if (observable in watcherDisposer) {
            watcherDisposer[observable]()
          }

          // Set property of shadow state.

          // If option opts.raw === true, Vues markRaw() will tag all objects as raw objects
          // preventing huge reactivity objects from being created (use opts.raw = true)
          // If option opts.raw is an array of properties, then markRaw()
          // will be applied only to those object properties
          if (opts.raw === true || typeof rawMap[observable] !== 'undefined') {
            // Handle raw
            if (typeof state[observable] === 'object') {
              if (Array.isArray(newValue)) {
                // Handle array
                state[observable] = newValue.map(el => typeof el === 'object' ? markRaw(fullClone(el)) : fullClone(el))
              } else {
                // Handle object
                state[observable] = markRaw(fullClone(newValue))
              }
            } else {
              // Primitives values are copied by value, no need to markRaw() or clone them
              state[observable] = newValue
            }
          } else {
            // Full clone the property without marking it raw
            state[observable] = fullClone(newValue)
          }

          // Create Vue watcher and its disposer
          if (observable in createWatcher) {
            watcherDisposer[observable] = createWatcher[observable]()
          }
        })
      }

      // Create MobX reaction and store the reaction disposer
      reactionDisposer[observable] = createReaction[observable]()
    }
  }

  // Dispose MobX reactions and Vue watchers on
  // scope destruction to prevent memory leaks
  tryOnScopeDispose(() => {
    for (let observable in reactionDisposer) reactionDisposer[observable]()
    for (let observable in watcherDisposer) watcherDisposer[observable]()
  })

  // Attach to the source object
  // if it is not attached already
  if (opts.attach && !(shadowProp(opts.attach) in obj)) {
    obj[shadowProp(opts.attach)] = state
  }

  return state
}