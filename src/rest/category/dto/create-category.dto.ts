import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({
    message: 'Category name must be a string',
  })
  @Transform((name) => name?.value.trim().toUpperCase())
  nameCategory: string
  @IsBoolean({ message: 'Category status must be a boolean' })
  @IsOptional()
  isDeleted?: boolean
}
