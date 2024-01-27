import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class ResponseProductDto{
    @ApiProperty({ example: '5c9d94ac-344f-4992-a714-4243b0787263', description: 'Product ID' })
    id: string;

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
    imagen: string

    @ApiProperty({
        example: '2024-01-01T11:00:00Z',
        description: 'Date and time of product creation.',
    })
    createdAt: Date

    @ApiProperty({
        example: '2024-01-01T11:00:00Z',
        description: 'Date and time of last product update.',
    })
    updatedAt: Date

    @ApiProperty({
        example: false,
        description: 'Indicate if the producto has been deleted',
    })
    isDeleted: boolean

    @ApiProperty({ example: 'Pan', description: 'Product category' })
    categoria: string

    @ApiProperty({example: 'A29268166', description: "Product provider"})
    provider: string;
}