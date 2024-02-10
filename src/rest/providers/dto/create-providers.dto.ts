import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
/**
 * Dto para crear un proveedor
 * @property {string} NIF - NIF del proveedor
 * @property {string} number - Numero del proveedor
 * @property {string} name - Nombre del proveedor
 */
export class CreateProvidersDto {
  /**
   * NIF del proveedor
   * @type {string}
   * @memberof CreateProvidersDto
   */

  @IsString()
  @Length(9, 9, { message: 'The NIF must be 9 characters long' })
  @ApiProperty({
    description: 'NIF of the provider',
    minLength: 9,
    maxLength: 9,
  })
  NIF: string

  /**
   * Numero del proveedor
   * @type {string}
   * @memberof CreateProvidersDto
   */
  @IsString()
  @Matches(/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/, { message: 'Invalid number format' })
  @ApiProperty({
    description: 'Number of the provider in the format XXX-XX-XXXX',
    pattern: '^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
  })
  number: string

  /**
   * Nombre del proveedor
   * @type {string}
   * @memberof CreateProvidersDto
   */
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  @ApiProperty({
    description: 'Name of the provider',
    minLength: 2,
    maxLength: 50,
  })
  name: string
}
