import { inject, injectable } from 'inversify'
import { action, makeObservable, observable, computed, comparer } from 'mobx'
import { AuthenticationRepository } from './AuthenticationRepository'
import { MessagesPresenter } from '../Core/Messages/MessagesPresenter'
import { Router } from '../Routing/Router'
import { useMobX, notify } from '@/Composables/useMobX';

@injectable()
export class LoginRegisterPresenter extends MessagesPresenter {

  @inject(AuthenticationRepository) authenticationRepository: AuthenticationRepository

  @inject(Router) router: Router

  email = null
  password = {
    test: {
      rest: 'best'
    }
  }

  option = null

  observables = {
    email: observable,
    password: observable,
    option: observable,
    reset: action,
    login: action,
    register: action,
    logOut: action,
    setAuthRepoTest: action,
    awesome: computed,
    viewTest: computed,
    viewTest2: computed,
    _awesome: observable
  }

  get vm () {

    const observables = {
      ...this.observables,
      ...this.messagesObservables
    }

    return useMobX(this, observables, { attach: '__vm' })
  }

  constructor () {
    super()
    makeObservable(this, this.observables)
    this.init()
    // this.getVm()
  }

  //
  get viewTest () {
    // console.log('computed', this.email, ' + ',this)
    return this.authenticationRepository.testVariable.map(pm => {
      // console.log('->pm', pm['test1'])
      return { test1: pm.test1 , sub: pm.sub, test2: pm.test2 + '(oulala)' }
    })
  }

  //
  get viewTest2 () {
    return this.authenticationRepository.testVariable2
  }
  //
  set viewTest (value) {
    console.log('this!', this)
    this.authenticationRepository.testVariable = value
  }

  setAuthRepoTest () {
    this.authenticationRepository.testVariable.push(
      { test1: 'test1!', test2: 'test1!', sub: { test: 'yes' } }
    )
  }

  _awesome = 0

  get awesome() {
    return this._awesome
  }

  set awesome (value){
    this._awesome = value
  }

  setAuthRepoArrayKey () {
    console.log('this.authenticationRepository.testVariable[0]', this.authenticationRepository.testVariable[0])

    this.authenticationRepository.testVariable[0].sub.test = 'aaaaaaaaaaa';
    this.authenticationRepository.testVariable[0].sub.rest = 'aaaaaaaaaaa';

    notify(this.authenticationRepository, 'testVariable', 0)
  }

  setInjectableObservableSubProperties () {
    console.log('this.authenticationRepository.testVariable2', this.authenticationRepository.testVariable2)
    this.authenticationRepository.testVariable2.awesome.super = 'test'
    this.authenticationRepository.testVariable2.awesome.duper = 'test'

    notify(this.authenticationRepository, 'testVariable2')
  }

  setObjectSubProperty () {
    this.password.test.rest = 2

    notify(this, 'password')
  }

  setViewTestViaMethod () {
    this.viewTest = [{test1:'aloha', sub:{test:'mmmmmm'}}]
  }

  reset () {
    this.email = ''
    // this.password = ''
    this.option = 'login'
  }

  async login () {
    const loginPm = await this.authenticationRepository.login(this.email, this.password)

    console.log('this', this)
    this.unpackRepositoryPmToVm(loginPm, 'User logged in')

    if (loginPm.success) {
      this.router.goToId('homeLink')
    }
  }

  async register () {
    const registerPm = await this.authenticationRepository.register(this.email, this.password)

    console.log('this', this)
    this.unpackRepositoryPmToVm(registerPm, 'User registered')
  }

  async logOut () {
    this.authenticationRepository.logOut()
    this.router.goToId('loginLink')
  }
}

// Object.defineProperty(LoginRegisterPresenter.prototype, 'viewTest', { enumerable: true });
