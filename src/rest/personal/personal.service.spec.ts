import {Test, TestingModule} from '@nestjs/testing';
import {PersonalService} from './personal.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {PersonalEntity} from './entities/personal.entity';
import {Repository} from 'typeorm';
import {Cache} from 'cache-manager'
import {CACHE_MANAGER} from '@nestjs/cache-manager'
import {ResponsePersonalDto} from "./dto/response-personal.dto";
import {Category} from "../category/entities/category.entity";
import {MapperPersonal} from "./mapper/mapperPersonal";
import {Paginated} from 'nestjs-paginate'
import {hash} from "typeorm/util/StringUtils";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {CreatePersonalDto} from "./dto/create-personal.dto";
import {UpdatePersonalDto} from "./dto/update-personal.dto";


describe('PersonalService', () => {
    let service: PersonalService;
    let personalRepository: Repository<PersonalEntity>;
    let categoryRepository: Repository<Category>;
    let personalMapper: MapperPersonal;
    let cacheManager: Cache;

    const personalMapperMock = {
        toEntity: jest.fn(),
        toResponseDto: jest.fn(),
    };

    const cacheManagerMock = {
        get: jest.fn(() => Promise.resolve()),
        set: jest.fn(() => Promise.resolve()),
        del: jest.fn(() => Promise.resolve()),

    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            // Aquí podrías importar módulos si es necesario
            providers: [
                PersonalService,
                {provide: getRepositoryToken(PersonalEntity), useClass: Repository},
                {provide: getRepositoryToken(Category), useClass: Repository},
                {provide: MapperPersonal, useValue: personalMapperMock},
                {provide: CACHE_MANAGER, useValue: cacheManagerMock},
            ],
        }).compile();

        service = module.get<PersonalService>(PersonalService);
        personalRepository = module.get(getRepositoryToken(PersonalEntity));
        categoryRepository = module.get(getRepositoryToken(Category));
        personalMapper = module.get<MapperPersonal>(MapperPersonal);
        cacheManager = module.get<Cache>(CACHE_MANAGER);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return a page of personal', async () => {

            const paginateOptions = {
                page: 1,
                limit: 10,
                path: 'personal',
            }
            const testProductos = {
                data: [],
                meta: {
                    itemsPerPage: 10,
                    totalItems: 1,
                    currentPage: 1,
                    totalPages: 1,
                },
                links: {
                    current: 'personal?page=1&limit=10&sortBy=nombre:ASC',
                },
            } as Paginated<ResponsePersonalDto>
            jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
            jest.spyOn(cacheManager, 'set').mockResolvedValue()
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                addOrderBy: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([]),
            }
            jest
                .spyOn(personalRepository, 'createQueryBuilder')
                .mockReturnValue(mockQueryBuilder as any)
            jest
                .spyOn(personalMapper, 'toResponseDto')
                .mockReturnValue({} as ResponsePersonalDto)
            const result: any = await service.findAll(paginateOptions)
            expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
            expect(result.meta.currentPage).toEqual(paginateOptions.page)
            expect(result.links.current).toEqual(
                `personal?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`,
            )
            expect(cacheManager.get).toHaveBeenCalled()
            expect(cacheManager.set).toHaveBeenCalled()
        });
        it('should return cached result', async () => {
            const paginateOptions = {
                page: 1,
                limit: 10,
                path: 'personal',
            }
            const testPrersonal = {
                data: [],
                meta: {
                    itemsPerPage: 10,
                    totalItems: 1,
                    currentPage: 1,
                    totalPages: 1,
                },
                links: {
                    current: 'personal?page=1&limit=10&sortBy=nombre:ASC',
                },
            } as Paginated<Category>
            jest.spyOn(cacheManager, 'get').mockResolvedValue(testPrersonal)
            const result = await service.findAll(paginateOptions)
            expect(cacheManager.get).toHaveBeenCalledWith(
                `all_staff_page_${hash(JSON.stringify(paginateOptions))}`,
            )
            expect(result).toEqual(testPrersonal)
        })

    });
    describe('findOne', () => {
        it('retrieve a producto by id', async () => {
            const result = new PersonalEntity()
            const reslDto = new ResponsePersonalDto()
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(result),
            }
            jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
            jest
                .spyOn(personalRepository, 'createQueryBuilder')
                .mockReturnValue(mockQueryBuilder as any)
            jest.spyOn(personalMapper, 'toResponseDto').mockReturnValue(reslDto)
            jest.spyOn(cacheManager, 'set').mockResolvedValue()
            expect(await service.findOne('b814e15c-c262-42f1-9168-6ce5f69defe9')).toEqual(reslDto)
            expect(personalMapper.toResponseDto).toHaveBeenCalledTimes(1)
        })
        it('should throw an error if personal does not exist', async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            }
            jest
                .spyOn(personalRepository, 'createQueryBuilder')
                .mockReturnValue(mockQueryBuilder as any)
            await expect(service.findOne('b814e15c-c262-42f1-9168-6ce5f69defe9')).rejects.toThrow(NotFoundException)
        })

    })
    describe('create', () => {
        it('should create a new personal', async () => {
            const createPersonalDto = new CreatePersonalDto()

            const mockCategory = new Category()
            const mockPersonal = new PersonalEntity()
            const mockResponsePersonalDto = new ResponsePersonalDto()

            jest
                .spyOn(service, 'checkCategory')
                .mockResolvedValue(mockCategory)
            jest.spyOn(personalMapper, 'toEntity').mockReturnValue(mockPersonal)
            jest
                .spyOn(personalRepository, 'save')
                .mockResolvedValue(mockPersonal)
            jest
                .spyOn(personalMapper, 'toResponseDto')
                .mockReturnValue(mockResponsePersonalDto)

            expect(await service.create(createPersonalDto)).toEqual(
                mockResponsePersonalDto,
            )
            expect(personalMapper.toEntity).toHaveBeenCalled()
            expect(personalRepository.save).toHaveBeenCalled()
            expect(service.checkCategory).toHaveBeenCalled()

        })

    })
    describe('update', () => {
        it('should update a producto', async () => {
            const updateProductoDto = new UpdatePersonalDto()

            const mockPersonalEntity = new PersonalEntity()
            const mockResponsePersonalDto = new ResponsePersonalDto()
            const mockCategoriaEntity = new Category()

            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(mockPersonalEntity),
            }
            jest
                .spyOn(personalRepository, 'createQueryBuilder')
                .mockReturnValue(mockQueryBuilder as any)
            jest
                .spyOn(service, 'checkCategory')
                .mockResolvedValue(mockCategoriaEntity)
            jest.spyOn(service, 'exists').mockResolvedValue(mockPersonalEntity)
            jest
                .spyOn(personalRepository, 'save')
                .mockResolvedValue(mockPersonalEntity)
            jest
                .spyOn(personalMapper, 'toResponseDto')
                .mockReturnValue(mockResponsePersonalDto)

            expect(await service.update('b814e15c-c262-42f1-9168-6ce5f69defe9', updateProductoDto)).toEqual(
                mockResponsePersonalDto,)
        })
    })
    describe('remove', () => {
        it('should remove a personal', async () => {
            const mockPersonalEntity = new PersonalEntity()
            const mockResponsePersonalDto = new ResponsePersonalDto()
            jest.spyOn(service, 'exists').mockResolvedValue(mockPersonalEntity)
            jest
                .spyOn(personalRepository, 'remove')
                .mockResolvedValue(mockPersonalEntity)

            jest
                .spyOn(personalMapper, 'toResponseDto')
                .mockReturnValue(mockResponsePersonalDto)
            expect(await service.remove('b814e15c-c262-42f1-9168-6ce5f69defe9')).toEqual(mockResponsePersonalDto)


        })
    })
    describe('removeSoft', () => {
        it('should soft remove a personal', async () => {
            const mockpersonalEntity = new PersonalEntity()
            const mockResponsepersonalDto = new ResponsePersonalDto()

            jest.spyOn(service, 'exists').mockResolvedValue(mockpersonalEntity)

            jest
                .spyOn(personalRepository, 'save')
                .mockResolvedValue(mockpersonalEntity)

            jest
                .spyOn(personalMapper, 'toResponseDto')
                .mockReturnValue(mockResponsepersonalDto)

            expect(await service.removeSoft('b814e15c-c262-42f1-9168-6ce5f69defe9')).toEqual(mockResponsepersonalDto)
        })
    })
    describe('exists', () => {
        const result = new PersonalEntity()
        it('should return true if personal exists', async () => {
            const id = 1
            jest
                .spyOn(personalRepository, 'findOneBy')
                .mockResolvedValue(new PersonalEntity())

            expect(await service.exists('b814e15c-c262-42f1-9168-6ce5f69defe9')).toEqual(result)
        })

        it('should return false if personal does not exist', async () => {
            const id = 1
            jest.spyOn(personalRepository, 'findOneBy').mockResolvedValue(undefined)

            await expect(service.exists('b814e15c-c262-42f1-9168-6ce5f69defe9')).rejects.toThrow(NotFoundException)
        })
    })
    describe('checkCategoria', () => {
        it('should return true if category exists', async () => {
            const categoria = new Category()
            const categoriaNombre = 'some-category'

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(categoria),
            }

            jest
                .spyOn(categoryRepository, 'createQueryBuilder')
                .mockReturnValue(mockQueryBuilder as any)

            expect(await service.checkCategory(categoriaNombre)).toBe(categoria)
        })

        it('should return false if category does not exist', async () => {
            const categoriaNombre = 'some-category'

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(undefined),
            }

            jest
                .spyOn(categoryRepository, 'createQueryBuilder')
                .mockReturnValue(mockQueryBuilder as any)

            await expect(service.checkCategory(categoriaNombre)).rejects.toThrow(
                BadRequestException,
            )
        })
    })

});

