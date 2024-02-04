import { PartialType } from '@nestjs/mapped-types'
import { CreateCategoryDto } from './create-category.dto'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    example: 'Manager',
    description: 'Category name',
  })
  @IsString({
    message: 'Category name must be a string',
  })
  @Transform((name) => name?.value.trim())
  @IsOptional()
  nameCategory?: string
  @ApiProperty({
    example: false,
    description: 'Status of category',
  })
  @IsBoolean({ message: 'Category status must be a boolean' })
  @IsOptional()
  isDeleted?: boolean
}
