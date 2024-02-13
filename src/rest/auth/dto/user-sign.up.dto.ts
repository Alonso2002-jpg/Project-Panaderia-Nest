import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'

export class UserSignUpDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name is invalid' })
  name: string

  @IsNotEmpty({ message: 'Lastname is required' })
  @IsString({ message: 'Lastname is invalid' })
  lastname: string

  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username is invalid' })
  username: string

  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsString({ message: 'Password is invalid' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password is not valid; it must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.',
  })
  password: string
}
