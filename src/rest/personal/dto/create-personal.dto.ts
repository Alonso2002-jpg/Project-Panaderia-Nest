import {IsBoolean, IsEmail, IsNotEmpty, Matches} from 'class-validator'
import {ApiProperty} from "@nestjs/swagger";

/**
 * DTO for creating a personal record.
 */
export class CreatePersonalDto {
    /**
     * Personal ID number.
     * Must consist of 8 digits followed by one letter.
     * @example '03488998J'
     */
    @ApiProperty({example: '03488998J', description: 'DNI of the personal', minLength: 9, maxLength: 9})
    @IsNotEmpty({message: 'DNI cannot be empty'})
    @Matches(/^[0-9]{8}[a-zA-Z]$/, {
        message: 'DNI must have 8 numbers followed by a letter',
    })
    dni: string;

    /**
     * Full name of the personal.
     * Must start with a capital letter and be longer than 3 characters for each name.
     * @example 'Juan Carlos'
     */
    @ApiProperty({example: 'Juan Carlos', description: 'Name of the personal', minLength: 3, maxLength: 100})
    @IsNotEmpty({message: 'Name cannot be empty'})
    @Matches(/^[A-Z][a-z]{3,}\s[A-Z][a-z]{3,}(\s[A-Z][a-z]{3,})?$/, {
        message: 'Names and surnames must start with a capital letter and be longer than 3 characters',
    })
    name: string;

    /**
     * Email address of the personal.
     * @example 'kevin@example.com'
     */
    @ApiProperty({
        example: 'kevin@example.com',
        description: 'Email address of the personal',
    })
    @IsEmail({}, {message: 'Email is not valid'})
    @IsNotEmpty({message: 'Email cannot be empty'})
    email: string;

    /**
     * Section of the company the personal belongs to.
     * @example 'BAKER'
     */
    @ApiProperty({example: 'BAKER', description: 'Section of the personal', minLength: 3, maxLength: 100})
    @IsNotEmpty({message: 'Section cannot be empty'})
    section: string;

    /**
     * Active status of the personal.
     * @example true
     */
    @ApiProperty({example: true, description: 'Active status of the personal'})
    @IsBoolean({message: 'Active status must be specified'})
    isActive: boolean;
}