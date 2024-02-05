import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  UseInterceptors,
  Logger,
  UseGuards,
} from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { ProvidersEntity } from './entities/providers.entity'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/common/cache'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { UpdateProvidersDto } from './dto/update-providers.dto'
import { Roles, RolesAuthGuard } from '../auth/guards/rols-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BodyValidatorPipe } from "../utils/pipes/body-validator.pipe";
import { IntValidatorPipe } from "../utils/pipes/int-validator.pipe";

@ApiTags('providers')
@UseInterceptors(CacheInterceptor)
@Controller('Providers')
/**
 * Controlador de Proveedores a cargo de manejar con las solicitudes de proveedores
 */
export class ProvidersController {
  private readonly logger: Logger = new Logger(ProvidersController.name)

  /**
   * Constructor metodo para ProvidersController
   * @param {ProvidersService} ProvidersService ProvidersService dependency
   */
  constructor(private readonly ProvidersService: ProvidersService) {}

  /**
   * findAll metodo para devolver todos los Proveedores
   * @returns {Promise<ProvidersEntity[]>} Lista de proveedores
   */
  @CacheKey('all_providers')
  @CacheTTL(30)
  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all providers',
    description: 'Get a list of all providers',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ProvidersEntity,
    isArray: true,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Find all providers')
    return await this.ProvidersService.findAll(query)
  }

  /**
   * findOne metodo para buscar proveedores por su id
   * @param {string} id Providers id
   * @returns {Promise<ProvidersEntity>} Providers entity
   */
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get a provider by ID',
    description: 'Get a provider by its ID',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id', new IntValidatorPipe()) id: number): Promise<ProvidersEntity> {
    this.logger.log(`Obtaining provider with ID: ${id}`)
    return this.ProvidersService.findOne(+id)
  }

  /**
   * create metodo para crear un proveedor
   * @param {ProvidersEntity} Providers Providers entity
   * @returns {Promise<ProvidersEntity>} Providers entity
   */
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new provider',
    description: 'Create a new provider',
  })
  @ApiResponse({ status: 201, description: 'Created', type: ProvidersEntity })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  create(@Body(new BodyValidatorPipe()) Providers: ProvidersEntity): Promise<ProvidersEntity> {
    this.logger.log('Creating a new provider')
    return this.ProvidersService.create(Providers)
  }

  /**
   * Update metodo para actualizar un proveedor
   * @param {string} id Proveedor id
   * @param {ProvidersEntity} Providers Proveedor entidad
   * @returns {Promise<ProvidersEntity>} Proveedor entidad
   */
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @Put(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update a provider',
    description: 'Update a provider by its ID',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  update(
    @Param('id', new IntValidatorPipe()) id: number,
    @Body(new BodyValidatorPipe()) Providers: UpdateProvidersDto,
  ): Promise<ProvidersEntity> {
    this.logger.log(`Updating provider with ID: ${id}`)
    return this.ProvidersService.update(+id, Providers)
  }

  /**
   * remove metodo para eliminar un proveedor
   * @param {string} id Providers id
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a provider',
    description: 'Delete a provider by its ID',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  remove(@Param('id', new IntValidatorPipe()) id: string): Promise<void> {
    this.logger.log(`Deleting provider with ID: ${id}`)
    return this.ProvidersService.remove(+id)
  }
}
