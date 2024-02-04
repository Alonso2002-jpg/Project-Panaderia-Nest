import { ApiProperty } from '@nestjs/swagger'

export class ResponseProductDto {
  @ApiProperty({
    example: '5c9d94ac-344f-4992-a714-4243b0787263',
    description: 'Product ID',
  })
  id: string

  @ApiProperty({ example: 'Pan de Barra', description: 'Product name' })
  name: string

  @ApiProperty({ example: 3.99, description: 'Product price' })
  price: number

  @ApiProperty({ example: 60, description: 'Product stock' })
  stock: number

  @ApiProperty({
    example: 'https://via.placeholder.com/150',
    description: 'Product image URL',
  })
  image: string

  @ApiProperty({ example: 'Pan', description: 'Product category name' })
  category: string

  @ApiProperty({ example: 'A29268166', description: 'Product provider NIF' })
  provider: string

  @ApiProperty({
    example: false,
    description: 'Indicate if the product has been deleted',
  })
  isDeleted: boolean
}
