import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Logger,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {PersonalService} from './personal.service';
import {CreatePersonalDto} from './dto/create-personal.dto';
import {UpdatePersonalDto} from './dto/update-personal.dto';
import {Paginate, PaginateQuery} from "nestjs-paginate";

/**
 * Controller that handles HTTP requests for the 'personal' resource.
 */
@Controller('personal')
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
    @HttpCode(201)
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createPersonalDto: CreatePersonalDto) {
        return this.personalService.create(createPersonalDto);
    }

    /**
     * Handles GET requests to retrieve all personal records, possibly paginated.
     * @param {PaginateQuery} query - Query parameters for pagination.
     * @returns A list of personal records.
     */
    @Get()
    @HttpCode(200)
    async findAll(@Paginate() query: PaginateQuery) {
        return this.personalService.findAll(query);
    }

    /**
     * Handles GET requests to retrieve a single personal record by its UUID.
     * @param {string} id - The UUID of the personal record to retrieve.
     * @returns The personal record with the given UUID.
     */
    @Get(':id')
    @HttpCode(200)
    findOne(@Param('id') id: string) {
        this.logger.log(`Searching for staff with id: ${id}`);
        return this.personalService.findOne(id);
    }

    /**
     * Handles PATCH requests to update an existing personal record by its UUID.
     * @param {string} id - The UUID of the personal record to update.
     * @param {UpdatePersonalDto} updatePersonalDto - DTO containing the data to update the personal record.
     * @returns The updated personal record.
     */
    @Patch(':id')
    @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
    update(
        @Param('id') id: string,
        @Body() updatePersonalDto: UpdatePersonalDto,
    ) {
        this.logger.log(`Updating staff with id: ${id}, Data: ${JSON.stringify(updatePersonalDto)}`);
        return this.personalService.update(id, updatePersonalDto);
    }

    /**
     * Handles DELETE requests to remove a personal record by its UUID.
     * @param {string} id - The UUID of the personal record to remove.
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        try {
            await this.personalService.removeSoft(id);
            this.logger.log(`Deleted staff with id: ${id}`);
        } catch (error) {
            this.logger.error(`Staff with id: ${id} does not exist`, error.stack);
            throw error;
        }
    }
}
