import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryMapper } from './mapper/category-mapper.service'

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryMapper.mapResponse(
      await this.categoryService.create(createCategoryDto),
    )
  }

  @Get()
  async findAll() {
    return this.categoryMapper.mapResponseList(
      await this.categoryService.findAll(),
    )
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryMapper.mapResponse(
      await this.categoryService.findOne(id),
    )
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryMapper.mapResponse(
      await this.categoryService.update(id, updateCategoryDto),
    )
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.remove(id)
  }
}
