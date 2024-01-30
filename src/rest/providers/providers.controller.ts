import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersEntity } from './entities/providers.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('providers') // Add tags for the entire controller
@Controller('Providers')
/**
 * Controlador de Proveedores a cargo de manejar con las solicitudes de proveedores
 */
export class ProvidersController {
  /**
   * Constructor metodo para ProvidersController
   * @param {ProvidersService} ProvidersService ProvidersService dependency
   */
  constructor(private readonly ProvidersService: ProvidersService) {}

  /**
   * findAll metodo para devolver todos los Proveedores
   * @returns {Promise<ProvidersEntity[]>} Lista de proveedores
   */
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  findAll(): Promise<ProvidersEntity[]> {
    return this.ProvidersService.findAll();
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  findOne(@Param('id') id: string): Promise<ProvidersEntity> {
    return this.ProvidersService.findOne(+id);
  }

  /**
   * create metodo para crear un proveedor
   * @param {ProvidersEntity} Providers Providers entity
   * @returns {Promise<ProvidersEntity>} Providers entity
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new provider',
    description: 'Create a new provider',
  })
  @ApiResponse({ status: 201, description: 'Created', type: ProvidersEntity })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  create(@Body() Providers: ProvidersEntity): Promise<ProvidersEntity> {
    return this.ProvidersService.create(Providers);
  }

  /**
   * update metodo para actualizar un proveedor
   * @param {string} id Proveedor id
   * @param {ProvidersEntity} Providers Proveedor entidad
   * @returns {Promise<ProvidersEntity>} Proveedor entidad
   */
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
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  update(
    @Param('id') id: string,
    @Body() Providers: ProvidersEntity,
  ): Promise<ProvidersEntity> {
    return this.ProvidersService.update(+id, Providers);
  }

  /**
   * remove metodo para eliminar un proveedor
   * @param {string} id Providers id
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a provider',
    description: 'Delete a provider by its ID',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  remove(@Param('id') id: string): Promise<void> {
    return this.ProvidersService.remove(+id);
  }
}
