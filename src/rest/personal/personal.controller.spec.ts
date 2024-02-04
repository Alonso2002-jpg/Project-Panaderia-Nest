import {Test, TestingModule} from '@nestjs/testing';
import {PersonalController} from './personal.controller';
import {PersonalService} from './personal.service';
import {ResponsePersonalDto} from "./dto/response-personal.dto";
import {Paginated} from 'nestjs-paginate'
import {NotFoundException} from "@nestjs/common";
import {CreatePersonalDto} from "./dto/create-personal.dto";
import {UpdatePersonalDto} from "./dto/update-personal.dto";

describe('PersonalController', () => {
    let controller: PersonalController;
    let service: PersonalService;
    const productosServiceMock = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        removeSoft: jest.fn(),
    }
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PersonalController],
            providers: [{
                provide: PersonalService,
                useValue: productosServiceMock
            }],
        }).compile();

        controller = module.get<PersonalController>(PersonalController);
        service = module.get<PersonalService>(PersonalService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('findAll', () => {
        it('should get all Personal', async () => {
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

            jest.spyOn(service, 'findAll').mockResolvedValue(testProductos)
            const result: any = await controller.findAll(paginateOptions)

            expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
            expect(result.meta.currentPage).toEqual(paginateOptions.page)
            expect(result.meta.totalPages).toEqual(1)
            expect(result.links.current).toEqual(
                `personal?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
            )
            expect(service.findAll).toHaveBeenCalled()
        })
    })
    describe('findOne', () => {
        it('should get one personal', async () => {
            const id = '79311606-8743-4685-a2e0-7ade0c0daa3b'
            const mockResult: ResponsePersonalDto = new ResponsePersonalDto()

            jest.spyOn(service, 'findOne').mockResolvedValue(mockResult)
            await controller.findOne(id)
            expect(service.findOne).toHaveBeenCalledWith(id)
            expect(mockResult).toBeInstanceOf(ResponsePersonalDto)
        })

        it('should throw NotFoundException if producto does not exist', async () => {
            const id = '79311606-8743-4685-a2e0-7ade0c0daa3b'
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
            await expect(controller.findOne('79311606-8743-4685-a2e0-7ade0c0daa3b')).rejects.toThrow(NotFoundException)
        })
    })
    describe('create', () => {
        it('should create a Personal', async () => {
            const dto: CreatePersonalDto = {

                dni: 'test',
                name: 'test',
                email: 'test',
                section: 'test',
                isActive: true,
            }
            const mockResult: ResponsePersonalDto = new ResponsePersonalDto()
            jest.spyOn(service, 'create').mockResolvedValue(mockResult)
            await controller.create(dto)
            expect(service.create).toHaveBeenCalledWith(dto)
            expect(mockResult).toBeInstanceOf(ResponsePersonalDto)
        })
    })
    describe('update', () => {
        it('should update a personal', async () => {
            const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
            const dto: UpdatePersonalDto = {
                name: 'test',
                section: 'test',
                isActive: true,
            }
            const mockResult: ResponsePersonalDto = new ResponsePersonalDto()
            jest.spyOn(service, 'update').mockResolvedValue(mockResult)
            await controller.update(id, dto)
            expect(service.update).toHaveBeenCalledWith(id, dto)
            expect(mockResult).toBeInstanceOf(ResponsePersonalDto)
        })

        it('should throw NotFoundException if personal does not exist', async () => {
            const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
            const dto: UpdatePersonalDto = {}
            jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
            await expect(controller.update(id, dto)).rejects.toThrow(
                NotFoundException,
            )
        })
        describe('remove', () => {
            it('should remove a personal', async () => {
                const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
                const mockResult: ResponsePersonalDto = new ResponsePersonalDto();
                jest.spyOn(service, 'removeSoft').mockResolvedValue(mockResult);
                await controller.remove(id);
                expect(service.removeSoft).toHaveBeenCalledWith(id);
            });

            it('should throw NotFoundException if personal does not exist', async () => {
                const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
                jest.spyOn(service, 'removeSoft').mockRejectedValue(new NotFoundException());
                await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
            });
        });

    })


});
