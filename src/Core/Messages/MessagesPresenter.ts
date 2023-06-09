import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'
import { MessagesRepository } from './MessagesRepository'

@injectable()
export abstract class MessagesPresenter {

  @inject(MessagesRepository) messagesRepository: MessagesRepository

  showValidationWarning = null

  messagesObservables = {
    showValidationWarning: observable,
    messages: computed,
    unpackRepositoryPmToVm: action,
  }

  constructor() {
    makeObservable(this, this.messagesObservables)
  }

  init = () => {
    this.showValidationWarning = false
    this.reset()
  }

  abstract reset(): void

  get messages() {
    return this.messagesRepository.appMessages
  }

  unpackRepositoryPmToVm = (pm, userMessage) => {
    this.showValidationWarning = !pm.success
    this.messagesRepository.appMessages = pm.success ? [userMessage] : [pm.serverMessage]
  }
}
