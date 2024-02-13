import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UserSignInDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string

  @ApiProperty({ example: 'Admin1', description: 'Contraseña' })
  @IsString({ message: 'Password is not valid' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string
}
