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

@Controller('personal')
export class PersonalController {
    private readonly logger = new Logger(PersonalController.name)

    constructor(private readonly personalService: PersonalService) {
    }

    @Post()
    @HttpCode(201)
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createPersonalDto: CreatePersonalDto) {
        return this.personalService.create(createPersonalDto)
    }

    @Get()
    @HttpCode(200)
    async findAll(@Paginate() query: PaginateQuery) {
        return this.personalService.findAll(query)
    }

    @Get(':id')
    @HttpCode(200)
    findOne(@Param('id') id: string) {
        this.logger.log(`Searching for staff with id: ${id}`)
        return this.personalService.findOne(id)
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
    update(
        @Param('id') id: string,
        @Body() updatePersonalDto: UpdatePersonalDto,
    ) {
        this.logger.log(
            `Updating staff with id: ${id}${JSON.stringify(updatePersonalDto)}`,
        )
        return this.personalService.update(id, updatePersonalDto)
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        try {
            await this.personalService.removeSoft(id)
            this.logger.log(`Deleting staff with id: ${id}`)
        } catch (error) {
            this.logger.error(`Staff with id: ${id} does not exist`, error.stack)
            throw error
        }
    }
}

