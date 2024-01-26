import { PartialType } from '@nestjs/mapped-types'
import { CreateCategoryDto } from './create-category.dto'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsString({
    message: 'Category name mus be a string',
  })
  @Transform((name) => name?.value.trim())
  @IsOptional()
  nameCategory?: string
  @IsBoolean({ message: 'Category status must be a boolean' })
  @IsOptional()
  isDeleted?: boolean
}
