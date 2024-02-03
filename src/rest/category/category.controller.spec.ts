import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { CategoryMapper } from './mapper/category-mapper.service'
import { Category } from './entities/category.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { ResponseCategoryDto } from './dto/response-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

describe('CategoryController', () => {
  let controller: CategoryController
  let service: CategoryService
  let mapper: CategoryMapper

  const mockCategory = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    hardRemove: jest.fn(),
    softRemove: jest.fn(),
    findRelations: jest.fn(),
  }

  const mockMapper = {
    mapResponse: jest.fn(),
    mapResponseList: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategory },
        { provide: CategoryMapper, useValue: mockMapper },
      ],
    }).compile()

    controller = module.get<CategoryController>(CategoryController)
    service = module.get<CategoryService>(CategoryService)
    mapper = module.get<CategoryMapper>(CategoryMapper)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of Category Responses', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([new Category()])
      jest
        .spyOn(mapper, 'mapResponseList')
        .mockReturnValue([new ResponseCategoryDto()])
      const categorys = await controller.findAll()

      expect(categorys).toHaveLength(1)
      expect(categorys[0]).toBeInstanceOf(ResponseCategoryDto)
      expect(service.findAll).toHaveBeenCalled()
      expect(mapper.mapResponseList).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return an Category Response', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(new Category())
      jest
        .spyOn(mapper, 'mapResponse')
        .mockReturnValue(new ResponseCategoryDto())
      const category = await controller.findOne(1)

      expect(category).toBeInstanceOf(ResponseCategoryDto)
      expect(service.findOne).toHaveBeenCalled()
      expect(mapper.mapResponse).toHaveBeenCalled()
    })

    it('should throw a NotFoundException if Category is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create and return an Category Response', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(new Category())
      jest
        .spyOn(mapper, 'mapResponse')
        .mockReturnValue(new ResponseCategoryDto())
      const category = await controller.create(new CreateCategoryDto())

      expect(category).toBeInstanceOf(ResponseCategoryDto)
      expect(service.create).toHaveBeenCalled()
      expect(mapper.mapResponse).toHaveBeenCalled()
    })

    it('should throw an BadRequestException if Category already exists', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      await expect(controller.create(new CreateCategoryDto())).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update and return an Category Response', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(new Category())
      jest
        .spyOn(mapper, 'mapResponse')
        .mockReturnValue(new ResponseCategoryDto())
      const category = await controller.update(1, new UpdateCategoryDto())

      expect(category).toBeInstanceOf(ResponseCategoryDto)
      expect(service.update).toHaveBeenCalled()
      expect(mapper.mapResponse).toHaveBeenCalled()
    })

    it('should throw a NotFoundException if Category is not found', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(
        controller.update(1, new UpdateCategoryDto()),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should remove a Category', async () => {
      const result = await controller.remove(1)
      expect(result).toBeUndefined()
    })

    it('should throw a NotFoundException if Category is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(1)).rejects.toThrow(NotFoundException)
    })
  })
})
