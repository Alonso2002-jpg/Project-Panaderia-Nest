import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    Min,
} from 'class-validator'


export class AddressDto {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    street: string

    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    number: string

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
