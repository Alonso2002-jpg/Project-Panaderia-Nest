import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Put,
  Logger,
  HttpCode,
  UseGuards,
  Patch,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common'
import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { ResponseProductDto } from './dto/response-product.dto'
import { UuidValidatorPipe } from '../utils/pipes/uuid-validator.pipe'
import { extname, parse } from 'path'
import { diskStorage } from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { FileInterceptor } from '@nestjs/platform-express'
import { ProductExistsGuard } from './guards/product-exists.guard'
import { BodyValidatorPipe } from '../utils/pipes/body-validator.pipe'

@Controller('products')
@UseInterceptors(CacheInterceptor)
@ApiTags('Products')
export class ProductController {
  private readonly logger: Logger = new Logger(ProductController.name)
  constructor(private readonly productService: ProductService) {}

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
    return await this.productService.findAll(query)
  }

  @Post()
  @HttpCode(201)
  //@UseGuards(JwtAuthGuard, RolesAuthGuard)
  //@Roles('ADMIN')
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
  @ApiBadRequestResponse({
    description: 'The provider does not exist or is not valid.',
  })
  create(@Body(new BodyValidatorPipe()) createProductDto: CreateProductDto) {
    this.logger.log(`Creating product`)
    return this.productService.create(createProductDto)
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
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Product ID',
  })
  findOne(@Param('id', new UuidValidatorPipe()) id: string) {
    this.logger.log(`Finding a product by id: ${id}`)
    return this.productService.findOne(id)
  }

  @Put(':id')
  //@UseGuards(JwtAuthGuard, RolesAuthGuard)
  //@Roles('ADMIN')
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
  @ApiBadRequestResponse({
    description: 'The provider does not exist or is not valid.',
  })
  @Put(':id')
  update(
    @Param('id', new UuidValidatorPipe()) id: string,
    @Body(new BodyValidatorPipe()) updateProductDto: UpdateProductDto,
  ) {
    this.logger.log(`Updating product`)
    return this.productService.update(id, updateProductDto)
  }

  @Delete(':id')
  @HttpCode(204)
  //@UseGuards(JwtAuthGuard, RolesAuthGuard)
  //@Roles('ADMIN')
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
  remove(@Param('id', new UuidValidatorPipe()) id: string) {
    this.logger.log(`Removing product`)
    return this.productService.remove(id)
  }

  @Patch('/image/:id')
  //@UseGuards(JwtAuthGuard, RolesAuthGuard)
  //@Roles('ADMIN')
  @UseGuards(ProductExistsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Updated image',
    type: ResponseProductDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String,
  })
  @ApiProperty({
    name: 'file',
    description: 'Image file',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Product ID',
  })
  @ApiBadRequestResponse({
    description: 'The file is not valid or of an unsupported type.',
  })
  @ApiBadRequestResponse({
    description: 'The file cannot be larger than 1 megabyte.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const uuid = uuidv4()
          const fileName = `${uuid}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Unsupported file. It is not of a valid image type.',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'The file size cannot be greater than 1 megabyte.',
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async updateImage(
    @Param('id', new UuidValidatorPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`Updating product image by ${id} with ${file.filename}`)
    return await this.productService.updateImage(id, file)
  }
}
