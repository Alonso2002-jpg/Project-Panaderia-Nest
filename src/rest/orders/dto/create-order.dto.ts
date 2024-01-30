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

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    province: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    country: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    postCode: string
}

export class ClientDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    fullName: string

    @IsString()
    @MaxLength(100)
    @IsEmail()
    email: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    telephone: string

    @IsNotEmpty()
    address: AddressDto
}

export class OrderLineDto {
    @IsNumber()
    @IsNotEmpty()
    idProduct: number

    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'The price must be greater than 0' })
    priceProduct: number

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'The stock must be greater than 0' })
    stock: number

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
