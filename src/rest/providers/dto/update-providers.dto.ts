import {IsNotEmpty, IsOptional, IsString, Length, Matches} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Transform} from "class-transformer";
import {PartialType} from "@nestjs/mapped-types";
import {CreateProvidersDto} from "./create-providers.dto";

/**
 * Dto para actualizar un proveedor en la base de datos de Providers
 */
export class UpdateProvidersDto extends PartialType(CreateProvidersDto) {
  /**
   * El id de un proveedor
   */
  @ApiProperty({ type: 'integer', description: 'The id of the provider' })
  id: number;

  /**
   * El NIF de un proveedor
   */
  @ApiProperty({ description: 'The NIF of the provider' })
  NIF: string;

  /**
   * El numero de telefono de un proveedor en el formato '###-##-####'
   */
  @Matches(/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/, { message: 'Invalid number format' })
  @ApiProperty({
    description: 'The phone number of the provider in the format ###-##-####',
    pattern: '^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
  })
  number: string;

  /**
   * El nombre del proveedor
   */
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  @ApiProperty({
    description: 'The name of the provider',
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @ApiProperty({
    example: 'Wholesaler',
    description: 'Provider type name',
  })
  @IsString()
  @IsNotEmpty({ message: 'The type is required' })
  @Transform((type) => type.value.trim())
  @IsOptional()
  type: string
}
