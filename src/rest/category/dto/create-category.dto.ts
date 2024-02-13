import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Manager',
    description: 'Category name',
  })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({
    message: 'Category name must be a string',
  })
  @Transform((name) => name?.value.trim().toUpperCase())
  nameCategory: string
  @ApiProperty({
    example: false,
    description: 'Status of the category',
  })
  @IsBoolean({ message: 'Category status must be a boolean' })
  @IsOptional()
  isDeleted?: boolean
}
