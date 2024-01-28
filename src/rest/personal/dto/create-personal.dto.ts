import {IsBoolean, IsEmail, IsNotEmpty, Matches} from 'class-validator'

export class CreatePersonalDto {
    @IsNotEmpty({message: 'DNI cannot be empty'})
    @Matches(/^[0-9]{8}[a-zA-Z]$/, {
        message: 'DNI must have 8 numbers followed by a letter',
    })
    dni: string

    @IsNotEmpty({message: 'Name cannot be empty'})
    @Matches(/^[A-Z][a-z]{3,}\s[A-Z][a-z]{3,}(\s[A-Z][a-z]{3,})?$/, {
        message:
            'Names and surnames must start with a capital letter and be longer than 3 characters',
    })
    name: string

    @IsEmail({}, {message: 'Email is not valid'})
    @IsNotEmpty({message: 'Email cannot be empty'})
    email: string

    @IsNotEmpty({message: 'Section cannot be empty'})
    section: string

    @IsBoolean({message: 'Active status must be specified'})
    isActive: boolean
}
