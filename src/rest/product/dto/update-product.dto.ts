import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min} from "class-validator";

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty({
        example: 'Pan de Barra',
        description: "Product name",
        minLength: 3,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(3, 100, { message: 'The name must be between 3 and 100 characters.' })
    name?: string;

    @ApiProperty({
        example: 3.99,
        description: "Product price",
        minimum: 0,
        maximum: 10000,
    })
    @IsOptional()
    @IsNumber({}, {message: 'The price must be a number.'})
    @Min(0, { message: "The price can't be negative."})
    @Max(10000, { message: 'The price must be equal or lower than 10000.'})
    price?: number;

    @ApiProperty({
        example: 60,
        description: "Product stock",
        minimum: 0,
        maximum: 10000,
    })
    @IsOptional()
    @IsInt({message: 'The stock must be a integer.'})
    @Min(0, { message: "The stock can't be negative."})
    @Max(100000, { message: 'The stock must be equal or lower than 100000.'})
    stock?: number;

    @ApiProperty({
        example: 'Pan',
        description: "Product category name"
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty({message: 'The category is required'})
    category?: string;

    @ApiProperty({
        example: 'A29268166',
        description: "Product provider NIF"
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty({message: 'The provider is required'})
    provider?: string;

    @ApiProperty({
        example: false,
        description: 'Indicate if the product has been deleted',
    })
    @IsOptional()
    @IsBoolean({message: "isDeleted must be a boolean"})
    isDeleted?: boolean;
}
