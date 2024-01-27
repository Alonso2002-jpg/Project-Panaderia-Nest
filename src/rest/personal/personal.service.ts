import {BadRequestException, Inject, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {CreatePersonalDto} from './dto/create-personal.dto';
import {UpdatePersonalDto} from './dto/update-personal.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {PersonalEntity} from "./entities/personal.entity";
import {Category} from "../category/entities/category.entity";
import {Repository} from "typeorm";
import {MapperPersonal} from "./mapper/mapperPersonal";
import {CACHE_MANAGER} from '@nestjs/cache-manager'
import {hash} from 'typeorm/util/StringUtils'
import {Cache} from 'cache-manager'
import {ResponsePersonalDto} from "./dto/response-personal.dto";
import {FilterOperator, FilterSuffix, paginate, PaginateQuery} from "nestjs-paginate";

@Injectable()
export class PersonalService {
    private readonly logger = new Logger(PersonalService.name)

    constructor(
        @InjectRepository(PersonalEntity)
        private readonly personalRepository: Repository<PersonalEntity>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly personalMapper: MapperPersonal,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {
    }

    async create(
        createPersonalDto: CreatePersonalDto,
    ): Promise<ResponsePersonalDto> {
        this.logger.log('Creating new staff: {createPersonalDto}')
        const category = await this.checkCategory(createPersonalDto.section)
        const newStaff = this.personalMapper.toEntity(createPersonalDto, category)
        const createdStaff = await this.personalRepository.save(newStaff)
        const dto = this.personalMapper.toResponseDto(createdStaff)
        return dto
    }

    public async checkCategory(categoryName: string): Promise<Category> {
        const cacheKey = `category_${categoryName.toLowerCase()}`
        const cachedCategory: Category = await this.cacheManager.get(cacheKey)

        if (cachedCategory) {
            this.logger.log(`Category ${categoryName} retrieved from cache`)
            return cachedCategory
        }

        const category = await this.categoryRepository
            .createQueryBuilder()
            .where('LOWER(name) = LOWER(:name)', {
                name: categoryName.toLowerCase(),
            })
            .getOne()

        if (!category) {
            this.logger.log(`Category ${categoryName} does not exist`)
            throw new BadRequestException(`Category ${categoryName} does not exist`)
        }

        await this.cacheManager.set(`category_${categoryName}`, category, 60)
        return category
    }

    async findAll(query: PaginateQuery) {
        this.logger.log('Searching for all staff members')
        const cacheKey = `all_staff_page_${hash(JSON.stringify(query))}`
        const cachedResult = await this.cacheManager.get(cacheKey)

        if (cachedResult) {
            this.logger.log('Retrieved staff from cache')
            return cachedResult
        }

        const queryBuilder = this.personalRepository
            .createQueryBuilder('personal')
            .leftJoinAndSelect('personal.category', 'category')

        const pagination = await paginate(query, queryBuilder, {
            sortableColumns: ['id', 'name'],
            defaultSortBy: [['id', 'ASC']],
            searchableColumns: ['name'],
            filterableColumns: {
                id: [FilterOperator.EQ, FilterSuffix.NOT],
                name: [FilterOperator.EQ, FilterSuffix.NOT],
                stock: [
                    FilterOperator.EQ,
                    FilterOperator.GT,
                    FilterOperator.GTE,
                    FilterOperator.LT,
                    FilterOperator.LTE,
                ],
                price: true,
                category: [FilterOperator.EQ, FilterSuffix.NOT],
                isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
            },
        })

        const result = {
            data: (pagination.data ?? []).map((personal) =>
                this.personalMapper.toResponseDto(personal),
            ),
            meta: pagination.meta,
            links: pagination.links,
        }

        await this.cacheManager.set(cacheKey, result, 60)
        this.logger.log('Staff list retrieved and cached')
        return result
    }

    async findOne(id: string): Promise<ResponsePersonalDto> {
        this.logger.log(`Searching for the staff member with id ${id}`)

        const cacheKey = `personal_${id}`
        const cachedPersonal: ResponsePersonalDto =
            await this.cacheManager.get(cacheKey)
        if (cachedPersonal) {
            this.logger.log(`Cache hit for the staff member with id ${id}`)
            return cachedPersonal
        }

        const personalToFind = await this.personalRepository
            .createQueryBuilder('personal')
            .leftJoinAndSelect('personal.section', 'category')
            .where('personal.id = :id', {id})
            .getOne()

        if (!personalToFind) {
            throw new NotFoundException(`Staff member with id ${id} not found`)
        }

        const personalDto = this.personalMapper.toResponseDto(personalToFind)

        await this.cacheManager.set(cacheKey, personalDto, 60)

        return personalDto
    }

    async update(
        id: string,
        updatePersonalDto: UpdatePersonalDto,
    ): Promise<ResponsePersonalDto> {
        this.logger.log(`Updating the staff member with id ${id}`)
        const personalToUpdate = await this.exists(id)
        let category: Category

        if (updatePersonalDto.section) {
            category = await this.checkCategory(updatePersonalDto.section)
        }

        const personalUpdated = await this.personalRepository.save({
            ...personalToUpdate,
            ...updatePersonalDto,
            section: category,
        })

        const dto = this.personalMapper.toResponseDto(personalUpdated)

        await this.cacheManager.del(`personal_${id}`)

        return dto
    }

    public async exists(id: string): Promise<PersonalEntity> {
        const cacheKey = `personal_${id}`

        const cachedPersonal: PersonalEntity = await this.cacheManager.get(cacheKey)
        if (cachedPersonal) {
            return cachedPersonal
        }
        const personal = await this.personalRepository.findOneBy({id})
        if (!personal) {
            throw new NotFoundException(`Staff member with id ${id} not found`)
        }
        await this.cacheManager.set(cacheKey, personal)
        return personal
    }

    async remove(id: string): Promise<ResponsePersonalDto> {
        const personalToRemove = await this.exists(id)
        const personalRemoved =
            await this.personalRepository.remove(personalToRemove)
        if (!personalRemoved) {
            throw new NotFoundException(`Staff member with id ${id} not found`)
        }
        const dto = this.personalMapper.toResponseDto(personalRemoved)

        await this.cacheManager.del(`personal_${id}`)
        return dto
    }

    async removeSoft(id: string): Promise<ResponsePersonalDto> {
        this.logger.log(`Remove soft  id:${id}`)
        const personalToRemove = await this.exists(id)
        personalToRemove.isActive = true

        const PersonalRemoved = await this.personalRepository.save(personalToRemove)
        const dto = this.personalMapper.toResponseDto(PersonalRemoved)
        await this.cacheManager.del(`funko_${id}`)

        return dto
    }
}
