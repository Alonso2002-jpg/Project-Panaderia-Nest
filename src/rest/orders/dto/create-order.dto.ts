import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    Min,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'


export class AddressDto {
    @ApiProperty({ example: 'Grove Hill',description: 'The street name', maxLength: 100, required: true })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    street: string

    @ApiProperty({ example: '3',description: 'The number of the street', maxLength: 50, required: true})
    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    number: string

    @ApiProperty({ example: 'Madrid',description: 'The name of the city', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    city: string

    @ApiProperty({ example: 'Leganes',description: 'The name of the province', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    province: string

    @ApiProperty({ example: 'Spain',description: 'The name of the country', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    country: string

    @ApiProperty({ example: '28911',description: 'The number of the postcode', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    postCode: string
}

export class ClientDto {
    @ApiProperty({ example: 'Evelyn Vanessa Obando Fernandez',description: 'Fullname of you ', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    fullName: string

    @ApiProperty({ example: 'obandofernandez1@gmail.com',description: 'Email of you', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsEmail()
    email: string

    @ApiProperty({ example: '602697979',description: 'Your phone number', maxLength: 100, required: true})
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    telephone: string

    @IsNotEmpty()
    address: AddressDto
}

export class OrderLineDto {
    @ApiProperty({example: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9', description: 'Product ID', maxLength: 100, required: true})
    @IsNumber()
    @IsNotEmpty()
    idProduct: string

    @ApiProperty({example: 9.99, description: 'Price of the product', minLength: 0, required: true})
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'The price must be greater than 0' })
    priceProduct: number

    @ApiProperty({example: 50, description: 'Stock of the product', minLength: 1, required: true})
    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'The stock must be greater than 0' })
    stock: number

    @ApiProperty({example: 9.99, description: 'Total of the product', minLength: 0, required: true})
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'The stock must be greater than 0' })
    total: number
}

export class CreateOrderDto {
    @IsNumber()
    @IsNotEmpty()
    idUser: number

    @IsNotEmpty()
    client: ClientDto

    @IsNotEmpty()
    orderLine: OrderLineDto[]
}
