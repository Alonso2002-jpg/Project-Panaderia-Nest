import { Injectable } from '@nestjs/common'
import { User } from '../entities/user.entity'
import { CreateUserDto } from '../dto/create-user.dto'
import { UserRole } from '../entities/user.roles.entity'
import { UserResponseDto } from '../dto/response-user.dto'

@Injectable()
export class UsersMapper {
  toResponseDto(user: User): UserResponseDto {
    const userDto = new UserResponseDto()
    userDto.id = user.id
    userDto.name = user.name
    userDto.lastname = user.lastname
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.rols = user.rols.map((role) => role.role)
    return userDto
  }

  toResponseDtoWithRoles(user: User, roles: UserRole[]): UserResponseDto {
    const userDto = new UserResponseDto()
    userDto.id = user.id
    userDto.name = user.name
    userDto.lastname = user.lastname
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.rols = roles.map((role) => role.role)
    return userDto
  }

  toEntity(createUserDto: CreateUserDto): User {
    const usuario = new User()
    usuario.name = createUserDto.name
    usuario.lastname = createUserDto.lastname
    usuario.email = createUserDto.email
    usuario.username = createUserDto.username
    usuario.password = createUserDto.password
    usuario.createdAt = new Date()
    usuario.updatedAt = new Date()
    usuario.isDeleted = false
    return usuario
  }
}
