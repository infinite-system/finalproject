import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'
import { MessagesRepository } from './MessagesRepository'

@injectable()
export abstract class MessagesPresenter {
  @inject(MessagesRepository)
  messagesRepository

  showValidationWarning = null

  abstract reset(): void
  get messages() {
    return this.messagesRepository.appMessages
  }

  constructor() {
    makeObservable(this, {
      showValidationWarning: observable,
      messages: computed,
      unpackRepositoryPmToVm: action,
    })
  }

  init = () => {
    this.showValidationWarning = false
    this.reset()
  }

  unpackRepositoryPmToVm = (pm, userMessage) => {
    this.showValidationWarning = !pm.success
    this.messagesRepository.appMessages = pm.success ? [userMessage] : [pm.serverMessage]
  }
}
