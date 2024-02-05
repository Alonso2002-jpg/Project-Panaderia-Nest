import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { OrdersService } from '../orders.service'

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(private readonly ordersService: OrdersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const body = request.body
    const idUser = body.idUser

    if (!idUser) {
      throw new BadRequestException('The user id is required')
    }

    if (isNaN(idUser)) {
      throw new BadRequestException('The user id is not valid')
    }

    return this.ordersService.userExists(idUser).then((exists) => {
      if (!exists) {
        throw new BadRequestException(' The user Id doesn`t exist on system')
      }
      return true
    })
  }
}
