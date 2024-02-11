import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  UseGuards, Put,
} from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryMapper } from './mapper/category-mapper.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseCategoryDto } from './dto/response-category.dto'
import { Roles, RolesAuthGuard } from '../auth/guards/rols-auth.guard'
import { Category } from './entities/category.entity'
import { IntValidatorPipe } from '../utils/pipes/int-validator.pipe'
import { BodyValidatorPipe } from '../utils/pipes/body-validator.pipe'

@Controller('category')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Category created succesfully.',
    type: ResponseCategoryDto,
  })
  @ApiBody({
    description: 'Data of Category to be created.',
    type: CreateCategoryDto,
  })
  @ApiBadRequestResponse({
    description: 'Category already exists',
  })
  @Roles('ADMIN')
  async create(
    @Body(new BodyValidatorPipe()) createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryMapper.mapResponse(
      await this.categoryService.create(createCategoryDto),
    )
  }

  @Get()
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of Categorys.',
    type: ResponseCategoryDto,
  })
  @Roles('ADMIN')
  async findAll() {
    return this.categoryMapper.mapResponseList(
      await this.categoryService.findAll(),
    )
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Category found succesfully by ID.',
    type: ResponseCategoryDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Category Identifier',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiBadRequestResponse({
    description: 'Category identifier must be a number',
  })
  @Roles('ADMIN')
  async findOne(@Param('id', new IntValidatorPipe()) id: number) {
    return this.categoryMapper.mapResponse(
      await this.categoryService.findOne(id),
    )
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Category updated succesfully by ID.',
    type: ResponseCategoryDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Category Identifier',
    type: Number,
  })
  @ApiBody({
    description: 'Data of Category to be updated.',
    type: UpdateCategoryDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiBadRequestResponse({
    description: 'Category identifier must be a number',
  })
  @Roles('ADMIN')
  async update(
    @Param('id', new IntValidatorPipe()) id: number,
    @Body(new BodyValidatorPipe()) updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryMapper.mapResponse(
      await this.categoryService.update(id, updateCategoryDto),
    )
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Category removed succesfully by ID.',
    type: Category,
  })
  @ApiParam({
    name: 'id',
    description: 'Category Identifier',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Roles('ADMIN')
  async remove(@Param('id', new IntValidatorPipe()) id: number) {
    return await this.categoryService.remove(id)
  }
}
