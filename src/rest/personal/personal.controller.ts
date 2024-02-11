import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Logger,
    Param,
    Post, Put,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {PersonalService} from './personal.service';
import {CreatePersonalDto} from './dto/create-personal.dto';
import {UpdatePersonalDto} from './dto/update-personal.dto';
import {Paginate, Paginated, PaginateQuery} from 'nestjs-paginate'
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import {CacheKey} from '@nestjs/cache-manager'
import {ResponsePersonalDto} from "./dto/response-personal.dto";
import {UuidValidatorPipe} from "../utils/pipes/uuid-validator.pipe";
import {Roles, RolesAuthGuard} from "../auth/guards/rols-auth.guard";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

/**
 * Controller that handles HTTP requests for the 'personal' resource.
 */
@Controller('personal')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('personal')
export class PersonalController {
    private readonly logger = new Logger(PersonalController.name);

    constructor(private readonly personalService: PersonalService) {
    }

    /**
     * Handles POST requests to create a new personal record.
     * @param {CreatePersonalDto} createPersonalDto - DTO containing the data to create a new personal.
     * @returns The newly created personal record.
     */

    @Post()
    @Roles('ADMIN')
    @ApiBearerAuth()
    @HttpCode(201)
    @ApiResponse({status: 201, description: 'Personal creadte .'})
    @ApiBody({description: 'Personnel data to create', type: CreatePersonalDto})
    @ApiBadRequestResponse({description: 'Invalid data'})
    @ApiBadRequestResponse({description: 'Invalid data category'})
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Body(new ValidationPipe()) createPersonalDto: CreatePersonalDto) {
        return await this.personalService.create(createPersonalDto);
    }

    /**
     * Handles GET requests to retrieve all personal records, possibly paginated.
     * @param {PaginateQuery} query - Query parameters for pagination.
     * @returns A list of personal records.
     */
    @Get()
    @Roles('ADMIN')
    @CacheKey('all_personal')
    @ApiResponse({
        status: 200,
        description:
            'Paginated staff list. You can filter by limit, page sortBy, filter and search',
        type: Paginated<ResponsePersonalDto>,
    })
    @ApiQuery({
        description:
            'Filter by limit per page',
        name: 'limit',
        required: false,
        type: Number,
    })
    @ApiQuery({
        description: 'Filter for page',
        name: 'page',
        required: false,
        type: Number,
    })
    @ApiQuery({
        description:
            'Sort filter: field:ASC|DESC',
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
        description: 'Search filter: search = valor',
        name: 'search',
        required: false,
        type: String,
    })
    @HttpCode(200)
    async findAll(@Paginate() query: PaginateQuery) {
        return await this.personalService.findAll(query);
    }

    /**
     * Handles GET requests to retrieve a single personal record by its UUID.
     * @param {string} id - The UUID of the personal record to retrieve.
     * @returns The personal record with the given UUID.
     */
    @Get(':id')
    @Roles('ADMIN')
    @ApiResponse({
        status: 200,
        description: 'personal not found',
        type: ResponsePersonalDto,
    })
    @ApiParam({
        name: 'id',
        description: 'Personnel identifier',
        type: Number,
    })
    @ApiNotFoundResponse({
        description: 'personal not found',
    })
    @ApiBadRequestResponse({
        description:
            'The product id is not valid',
    })
    @HttpCode(200)
    async findOne(@Param('id', new UuidValidatorPipe()) id: string) {
        this.logger.log(`Searching for staff with id: ${id}`);
        return await this.personalService.findOne(id);
    }

    /**
     * Handles PATCH requests to update an existing personal record by its UUID.
     * @param {string} id - The UUID of the personal record to update.
     * @param {UpdatePersonalDto} updatePersonalDto - DTO containing the data to update the personal record.
     * @returns The updated personal record.
     */
    @Put(':id')
    @Roles('ADMIN')
    @ApiResponse({
        status: 200,
        description: 'personal updated',
        type: ResponsePersonalDto,
    })
    @ApiParam({
        name: 'id',
        description: 'Personnel identifier',
        type: Number,
    })
    @ApiBody({
        description:
            'Product data to update',
        type: UpdatePersonalDto,
    })
    @ApiNotFoundResponse({
        description: 'personal not found',
    })
    @ApiBadRequestResponse({
        description:
            'Some of the fields are not valid according to the DTO specification',
    })
    @ApiBadRequestResponse({
        description: 'The category does not exist or is not valid',
    })
    @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
    async update(
        @Param('id', new UuidValidatorPipe()) id: string,
        @Body(new ValidationPipe()) updatePersonalDto: UpdatePersonalDto,
    ) {
        this.logger.log(`Updating staff with id: ${id}, Data: ${JSON.stringify(updatePersonalDto)}`);
        return await this.personalService.update(id, updatePersonalDto);
    }

    /**
     * Handles DELETE requests to remove a personal record by its UUID.
     * @param {string} id - The UUID of the personal record to remove.
     */
    @Delete(':id')
    @Roles('ADMIN')
    @ApiResponse({
        status: 204,
        description: 'personal deleted',
    })
    @ApiParam({
        name: 'id',
        description: 'Personnel identifier',
        type: Number,
    })
    @ApiNotFoundResponse({
        description: 'Personal not found',
    })
    @ApiBadRequestResponse({
        description: 'The staff id is not valid',
    })
    @HttpCode(204)
    async remove(@Param('id', new UuidValidatorPipe()) id: string) {
        try {
            await this.personalService.removeSoft(id);
            this.logger.log(`Deleted staff with id: ${id}`);
        } catch (error) {
            this.logger.error(`Staff with id: ${id} does not exist`, error.stack);
            throw error;
        }
    }
}
