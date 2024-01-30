import {Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseUUIDPipe, Put} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {CacheInterceptor} from "@nestjs/common/cache";

@Controller('product')
@UseInterceptors(CacheInterceptor)
@ApiTags('Products')
export class ProductController {
  private readonly logger : Logger = new Logger(ProductController.name)
  constructor(private readonly productService: ProductService) {
  }

  @Get()
  @CacheKey('all_products')
  @CacheTTL(30)
  @ApiResponse({
    status: 200,
    description:
        'Paginated list of products. It can be filtered by limit, page, sortBy, filter, and search.',
    type: Paginated<ResponseProductDto>,
  })
  @ApiQuery({
    description: 'Filter by limit per page.',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filter by page.',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Sorting filter: field:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Search filter: filter.field = $eq:value',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Search filter: search = value',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Find all products')
    return await this.productService.findAll(query);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ResponseProductDto,
  })
  @ApiBody({
    description: 'Data of the product to be created.',
    type: CreateProductDto,
  })
  @ApiBadRequestResponse({
    description:
        'Some of the fields are not valid according to the DTO specification.',
  })
  @ApiBadRequestResponse({
    description: 'The category does not exist or is not valid.',
  })
  create(@Body() createProductDto: CreateProductDto) {
    this.logger.log(`Creating product`)
    return this.productService.create(createProductDto);
  }


  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ResponseProductDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Producto not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Product ID',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Finding a product by id: ${id}`)
    return this.productService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ResponseProductDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String,
  })
  @ApiBody({
    description: 'Data of the product to be updated.',
    type: UpdateProductDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description:
        'Some of the fields are not valid according to the DTO specification.',
  })
  @ApiBadRequestResponse({
    description: 'The category does not exist or is not valid.',
  })
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    this.logger.log(`Updating product`)
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Producto deleted',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'The product id is not valid.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Removing product`)
    return this.productService.remove(id);
  }
}
