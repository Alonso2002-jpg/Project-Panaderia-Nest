import { Injectable } from '@nestjs/common'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { CreateUserDto } from '../../user/dto/create-user.dto'
import { Role } from '../../user/entities/user.roles.entity'

@Injectable()
export class AuthMapper {
  toCreateDto(userSignUpDto: UserSignUpDto): CreateUserDto {
    const userCreateDto = new CreateUserDto()
    userCreateDto.name = userSignUpDto.name
    userCreateDto.lastname = userSignUpDto.lastname
    userCreateDto.username = userSignUpDto.username
    userCreateDto.email = userSignUpDto.email
    userCreateDto.password = userSignUpDto.password
    userCreateDto.rols = [Role.USER]
    return userCreateDto
  }
}
