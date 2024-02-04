import { Injectable } from '@nestjs/common'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { Category } from '../entities/category.entity'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { ResponseCategoryDto } from '../dto/response-category.dto'

@Injectable()
export class CategoryMapper {
  mapCategory(createCategoriaDto: CreateCategoryDto): Category {
    const category = new Category()
    category.nameCategory = createCategoriaDto.nameCategory
    category.isDeleted = createCategoriaDto.isDeleted || false
    return category
  }

  mapCategoryUpd(
    updateCategoriaDto: UpdateCategoryDto,
    categoria: Category,
  ): Category {
    const categoryReturn = new Category()
    categoryReturn.id = categoria.id
    categoryReturn.nameCategory =
      updateCategoriaDto.nameCategory || categoria.nameCategory
    categoryReturn.isDeleted =
      updateCategoriaDto.isDeleted == undefined
        ? categoria.isDeleted
        : updateCategoriaDto.isDeleted
    categoryReturn.createdAt = categoria.createdAt
    return categoryReturn
  }

  mapResponse(categoria: Category): ResponseCategoryDto {
    const response = new ResponseCategoryDto()
    response.id = categoria.id
    response.nameCategory = categoria.nameCategory
    response.isDeleted = categoria.isDeleted
    return response
  }

  mapResponseList(categoryList: Category[]): ResponseCategoryDto[] {
    return categoryList.map((category) => this.mapResponse(category))
  }
}
