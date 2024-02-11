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
   * El NIF de un proveedor
   */
  @IsString()
  @Length(9, 9, { message: 'The NIF must be 9 characters long' })
  @ApiProperty({
    description: 'NIF of the provider',
    minLength: 9,
    maxLength: 9,
  })
  @Transform((NIF) => NIF.value.trim())
  @IsOptional()
  @ApiProperty({ description: 'The NIF of the provider' })
  NIF: string;

  /**
   * El numero de telefono de un proveedor en el formato '###-##-####'
   */
  @IsString()
  @Matches(/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/, { message: 'Invalid number format' })
  @Transform((number) => number.value.trim())
  @ApiProperty({
    description: 'Number of the provider in the format XXX-XX-XXXX',
    pattern: '^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
  })
  @IsOptional()
  number: string;

  /**
   * El nombre del proveedor
   */
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  @Transform((name) => name.value.trim())
  @ApiProperty({
    description: 'The name of the provider',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
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
