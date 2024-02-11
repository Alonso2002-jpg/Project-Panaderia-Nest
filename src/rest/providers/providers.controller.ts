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
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { UpdateProvidersDto } from './dto/update-providers.dto'
import { Roles, RolesAuthGuard } from '../auth/guards/rols-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BodyValidatorPipe } from '../utils/pipes/body-validator.pipe'
import { IntValidatorPipe } from '../utils/pipes/int-validator.pipe'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import {CreateProvidersDto} from "./dto/create-providers.dto";
import {ProvidersResponseDto} from "./dto/response-providers.dto";
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('providers')
@UseInterceptors(CacheInterceptor)
@Controller('providers')
/**
 * Controlador de Proveedores a cargo de manejar con las solicitudes de proveedores
 */
export class ProvidersController {
  private readonly logger: Logger = new Logger(ProvidersController.name)

  /**
   * Constructor metodo para ProvidersController
   * @param {ProvidersService} providersService Dependencia de ProvidersService
   */
  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Metodo para devolver todos los Proveedores
   * @returns {Promise<ProvidersEntity[]>} Lista de proveedores
   */
  @Roles('ADMIN')
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
    return await this.providersService.findAll(query)
  }

  /**
   * Metodo para buscar proveedores por su id
   * @param {string} id ID del proveedor
   * @returns {Promise<ProvidersEntity>} Entidad de proveedor
   */
  @Roles('ADMIN')
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get a provider by ID',
    description: 'Get a provider by its ID',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async findOne(@Param('id', new IntValidatorPipe()) id: number) {
    this.logger.log(`Obtaining provider with ID: ${id}`)
    return await this.providersService.findOne(+id)
  }

  /**
   * Metodo para crear un proveedor
   * @param {ProvidersEntity} Providers Entidad de proveedor
   * @returns {Promise<ProvidersEntity>} Entidad de proveedor
   */
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
  async create(
    @Body(new BodyValidatorPipe()) Providers: CreateProvidersDto,
  ): Promise<ProvidersResponseDto> {
    this.logger.log('Creating a new provider')
    return await this.providersService.create(Providers)
  }

  /**
   * Metodo para actualizar un proveedor
   * @param {string} id ID del proveedor
   * @param providers
   * @returns {Promise<ProvidersEntity>} entidad de Proveedor
   */
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
  async update(
    @Param('id', new IntValidatorPipe()) id: number,
    @Body(new BodyValidatorPipe()) providers: UpdateProvidersDto,
  ): Promise<ProvidersResponseDto> {
    this.logger.log(`Updating provider with ID: ${id}`)
    return await this.providersService.update(+id, providers)
  }

  /**
   * Metodo para eliminar un proveedor
   * @param {string} id Providers id
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a provider',
    description: 'Delete a provider by its ID',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async remove(@Param('id', new IntValidatorPipe()) id: string): Promise<void> {
    this.logger.log(`Deleting provider with ID: ${id}`)
    return await this.providersService.remove(+id)
  }
}
