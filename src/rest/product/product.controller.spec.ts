import { Test, TestingModule } from '@nestjs/testing'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseProductDto } from './dto/response-product.dto'
import { Paginated } from 'nestjs-paginate'
import { NotFoundException } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

describe('ProductController', () => {
  let controller: ProductController
  let service: ProductService

  const productServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: productServiceMock }],
    }).compile()

    controller = module.get<ProductController>(ProductController)
    service = module.get<ProductService>(ProductService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return a page of product response', async () => {
      const paginationOptions = {
        page: 1,
        limit: 10,
        path: 'products',
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
          current: 'products?page=1&limit=10&sortBy=id:ASC',
        },
      } as Paginated<ResponseProductDto>

      jest.spyOn(service, 'findAll').mockResolvedValue(testProductos)

      const result: any = await controller.findAll(paginationOptions)
      expect(result.meta.itemsPerPage).toEqual(paginationOptions.limit)
      expect(result.meta.currentPage).toEqual(paginationOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `products?page=${paginationOptions.page}&limit=${paginationOptions.limit}&sortBy=id:ASC`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a response of product by id', async () => {
      const expectedResult: ResponseProductDto = new ResponseProductDto()

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult)

      const actualResult = await controller.findOne(
        '5c9d94ac-344f-4992-a714-4243b0787263',
      )
      expect(actualResult).toEqual(expectedResult)
      expect(service.findOne).toHaveBeenCalled()
    })

    it("should throw an error if product doesn't exist", async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(
        controller.findOne('5c9d94ac-344f-4992-a714-4243b0787263'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = new CreateProductDto()

      const expectedResult: ResponseProductDto = new ResponseProductDto()

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult)

      const actualResult = await controller.create(createProductDto)
      expect(actualResult).toEqual(expectedResult)
      expect(service.create).toHaveBeenCalledWith(createProductDto)
      expect(actualResult).toBeInstanceOf(ResponseProductDto)
    })
  })

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = new UpdateProductDto()
      const id = '5c9d94ac-344f-4992-a714-4243b0787263'
      const expectedResult: ResponseProductDto = new ResponseProductDto()

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult)

      const actualResult = await controller.update(id, updateProductDto)
      expect(actualResult).toEqual(expectedResult)
      expect(service.update).toHaveBeenCalledWith(id, updateProductDto)
      expect(actualResult).toBeInstanceOf(ResponseProductDto)
    })

    it("should throw an error if product doesn't exist", () => {
      const id = '5c9d94ac-344f-4992-a714-4243b0787263'
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      expect(controller.update(id, new UpdateProductDto())).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a product', async () => {
      const id = '5c9d94ac-344f-4992-a714-4243b0787263'
      const expectedResult: ResponseProductDto = new ResponseProductDto()

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult)

      await controller.remove(id)
      expect(service.remove).toHaveBeenCalled()
    })

    it("should throw an error if product doesn't exist", async () => {
      const id = '5c9d94ac-344f-4992-a714-4243b0787263'
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateImage', () => {
    it('should update a product image', async () => {
      const mockId = '5c9d94ac-344f-4992-a714-4243b0787263'
      const mockFile = {} as Express.Multer.File
      const mockResult: ResponseProductDto = new ResponseProductDto()

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)

      await controller.updateImage(mockId, mockFile)
      expect(service.updateImage).toHaveBeenCalledWith(mockId, mockFile)
      expect(mockResult).toBeInstanceOf(ResponseProductDto)
    })
  })
})
