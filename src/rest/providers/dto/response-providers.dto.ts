import { ApiProperty } from '@nestjs/swagger';

/**
 * @class ProvidersResponseDto Dto de respuesta donde se mostrara los datos de un proveedor
 * @property {bigint} id - El id del proveedor.
 * @property {string} NIF - El NIF del proveedor.
 * @property {string} number - El numero del proveedor.
 * @property {string} name - El nombre del proveedor.
 * @property {Date} CreationDate - La fecha de creacion del proveedor.
 * @property {Date} UpdateDate - La fecha de actualizacion del proveedor.
 */
export class ProvidersResponseDto {
  @ApiProperty({ type: 'bigint', description: 'The id of the provider' })
  id: number;

  @ApiProperty({ description: 'The NIF of the provider' })
  NIF: string;

  @ApiProperty({ description: 'The number of the provider' })
  number: string;

  @ApiProperty({ description: 'The name of the provider' })
  name: string;

  @ApiProperty({ description: 'The type of the provider' })
  type: string;

  @ApiProperty({ type: Date, description: 'The creation date of the provider' })
  CreationDate: Date;

  @ApiProperty({ type: Date, description: 'The update date of the provider' })
  UpdateDate: Date;
}
