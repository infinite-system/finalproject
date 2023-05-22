import { inject, injectable } from 'inversify'
import { action, makeObservable } from 'mobx'
import { Types } from '../Core/Types'
import { Router } from '../Routing/Router'
import { UserModel } from '../Authentication/UserModel'
import { MessagePacking } from '../Core/Messages/MessagePacking'

@injectable()
export class AuthenticationRepository {
  @inject(Router)
  router

  @inject(Types.IDataGateway)
  dataGateway

  @inject(UserModel)
  userModel

  constructor() {
    makeObservable(this, {
      login: action,
    })
  }

  login = async (email, password) => {
    const loginDto = await this.dataGateway.post('/login', {
      email,
      password,
    })

    if (loginDto.success) {
      this.userModel.email = email
      this.userModel.token = loginDto.result.token
    }

    return MessagePacking.unpackServerDtoToPm(loginDto)
  }

  register = async (email, password) => {
    const registerDto = await this.dataGateway.post('/register', {
      email,
      password,
    })

    return MessagePacking.unpackServerDtoToPm(registerDto)
  }

  logOut = async () => {
    this.userModel.email = ''
    this.userModel.token = ''
  }
}
