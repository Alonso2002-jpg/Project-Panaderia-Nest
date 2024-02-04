import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsOptional } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  name: string
  @IsOptional()
  lastname: string
  @IsOptional()
  username: string
  @IsOptional()
  email: string
  @IsOptional()
  rols: string[]
  @IsOptional()
  password: string
  @IsOptional()
  isDeleted: boolean
}
