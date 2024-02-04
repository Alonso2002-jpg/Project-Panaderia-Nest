import * as request from 'supertest'
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common'
import { ResponseCategoryDto } from '../../../src/rest/category/dto/response-category.dto'
import { CreateCategoryDto } from '../../../src/rest/category/dto/create-category.dto'
import { UpdateCategoryDto } from '../../../src/rest/category/dto/update-category.dto'
import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from '../../../src/rest/category/category.controller'
import { CategoryService } from '../../../src/rest/category/category.service'
import { CacheModule } from '@nestjs/cache-manager'
import { Category } from '../../../src/rest/category/entities/category.entity'

describe('CategoryController (e2e)', () => {
  let app: INestApplication
  const myEndPoint: string = `/category`

  const categoryDto: Category = {
    id: 1,
    nameCategory: 'Test Category',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    providers: [],
    personal: [],
  }

  const responseCategoryDto: ResponseCategoryDto = {
    id: 1,
    nameCategory: 'Test Category Response',
    isDeleted: false,
  }

  const createCategoryDto: CreateCategoryDto = {
    nameCategory: 'Test Category Create',
  }

  const updateCategoryDto: UpdateCategoryDto = {
    nameCategory: 'Test Category Update',
  }

  const mockCategoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  const mockMapper = {
    mapResponse: jest.fn(),
    mapResponseList: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoryController],
      providers: [
        CategoryService,
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /category', () => {
    it('should return an array of Categorys', async () => {
      mockCategoryService.findAll.mockResolvedValue([categoryDto])
      mockMapper.mapResponseList.mockReturnValue([responseCategoryDto])

      const { body } = await request(app.getHttpServer())
        .get(myEndPoint)
        .expect(200)

      expect(() => {
        expect(body).toEqual([responseCategoryDto])
        expect(mockCategoryService.findAll).toHaveBeenCalled()
        expect(mockMapper.mapResponseList).toHaveBeenCalled()
      })
    })
  })

  describe('GET /category/:id', () => {
    it('should return a single Category', async () => {
      mockCategoryService.findOne.mockResolvedValue(categoryDto)
      mockMapper.mapResponse.mockReturnValue(responseCategoryDto)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndPoint}/${responseCategoryDto.id}`)
        .expect(200)

      expect(() => {
        expect(body).toEqual(responseCategoryDto)
        expect(mockCategoryService.findOne).toHaveBeenCalled()
        expect(mockMapper.mapResponse).toHaveBeenCalled()
      })
    })

    it('should throw an BadRequestException if Category does not exist', async () => {
      mockCategoryService.findOne.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .get(`${myEndPoint}/${responseCategoryDto.id}`)
        .expect(404)
    })
  })

  describe('POST /category', () => {
    it('should create and return an Category', async () => {
      mockCategoryService.create.mockResolvedValue(categoryDto)
      mockMapper.mapResponse.mockReturnValue(responseCategoryDto)

      const { body } = await request(app.getHttpServer())
        .post(myEndPoint)
        .send(createCategoryDto)
        .expect(201)

      expect(() => {
        expect(body).toEqual(responseCategoryDto)
        expect(mockCategoryService.create).toHaveBeenCalled()
        expect(mockMapper.mapResponse).toHaveBeenCalled()
      })
    })

    it('should throw an error if create request is empty', async () => {
      await request(app.getHttpServer())
        .post(myEndPoint)
        .send(new CreateCategoryDto())
        .expect(400)
    })

    it('should throw an error if category already exists', async () => {
      mockCategoryService.create.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .post(myEndPoint)
        .send(createCategoryDto)
        .expect(400)
    })
  })

  describe('PUT /category/:id', () => {
    it('should update and return an Category', async () => {
      mockCategoryService.update.mockResolvedValue(categoryDto)
      mockMapper.mapResponse.mockReturnValue(responseCategoryDto)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndPoint}/${responseCategoryDto.id}`)
        .send(updateCategoryDto)
        .expect(200)

      expect(() => {
        expect(body).toEqual(responseCategoryDto)
        expect(mockCategoryService.update).toHaveBeenCalled()
        expect(mockMapper.mapResponse).toHaveBeenCalled()
      })
    })

    it('should throw an error if update request is empty', async () => {
      await request(app.getHttpServer())
        .put(`${myEndPoint}/${responseCategoryDto.id}`)
        .send(new UpdateCategoryDto())
        .expect(400)
    })

    it('should throw an BadRequestException if Category does not exist', async () => {
      mockCategoryService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndPoint}/${responseCategoryDto.id}`)
        .send(updateCategoryDto)
        .expect(404)
    })
  })

  describe('DELETE /category/:id', () => {
    it('should delete a Category', async () => {
      await request(app.getHttpServer())
        .delete(`${myEndPoint}/${responseCategoryDto.id}`)
        .expect(204)
    })

    it('should throw an error if Category does not exist', async () => {
      mockCategoryService.remove.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndPoint}/${responseCategoryDto.id}`)
        .expect(404)
    })
  })
})
