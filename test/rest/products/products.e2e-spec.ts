import { INestApplication, NotFoundException } from '@nestjs/common'
import { ResponseProductDto } from '../../../src/rest/product/dto/response-product.dto'
import { CreateProductDto } from '../../../src/rest/product/dto/create-product.dto'
import { UpdateProductDto } from '../../../src/rest/product/dto/update-product.dto'
import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '@nestjs/cache-manager'
import { ProductController } from '../../../src/rest/product/product.controller'
import { ProductService } from '../../../src/rest/product/product.service'
import * as request from 'supertest'

describe('ProductController (e2e)', () => {
  let app: INestApplication
  const myEndPoint: string = `/products`

  const responseProductDto: ResponseProductDto = {
    id: '5c9d94ac-344f-4992-a714-4243b0787263',
    name: 'Pan de Barra',
    price: 3.99,
    stock: 60,
    image: 'https://via.placeholder.com/150',
    category: 'Test Category',
    provider: 'A29268166',
    isDeleted: false,
  }

  const createProductDto: CreateProductDto = {
    name: 'Pan de Barra',
    price: 3.99,
    stock: 60,
    category: 'Test Category',
    provider: 'A29268166',
  }

  const updateProductDto: UpdateProductDto = {
    name: 'Pan de Pizza',
    price: 2.99,
    stock: 70,
    category: 'Test Category',
    provider: 'A29268166',
    isDeleted: true,
  }

  const mockProductService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateImage: jest.fn(),
    exists: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProductController],
      providers: [
        ProductService,
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /products', () => {
    it('should return a page of products', async () => {
      mockProductService.findAll.mockResolvedValue([responseProductDto])

      const { body } = await request(app.getHttpServer())
        .get(myEndPoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([responseProductDto])
        expect(mockProductService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /products/:id', () => {
    it('should return a single product response', async () => {
      mockProductService.findOne.mockResolvedValue([responseProductDto])

      const { body } = await request(app.getHttpServer())
        .get(`${myEndPoint}/${responseProductDto.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual([responseProductDto])
        expect(mockProductService.findAll).toHaveBeenCalled()
      })
    })

    it('should throw an error if product doesn`t exists', async () => {
      mockProductService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndPoint}/${responseProductDto.id}`)
        .expect(404)
    })

    it('should throw an error if product ID is not valid', async () => {
      const id: string = '123'
      await request(app.getHttpServer()).get(`${myEndPoint}/${id}`).expect(400)
    })
  })

  describe('POST /products', () => {
    it('should create a new product', async () => {
      mockProductService.create.mockResolvedValue(responseProductDto)

      const { body } = await request(app.getHttpServer())
        .post(myEndPoint)
        .send(createProductDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(responseProductDto)
        expect(mockProductService.create).toHaveBeenCalledWith(createProductDto)
      })
    })
    it('should throw an error if create request is empty', async () => {
      await request(app.getHttpServer())
        .post(myEndPoint)
        .send(new CreateProductDto())
        .expect(400)
    })
  })

  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      mockProductService.update.mockResolvedValue(responseProductDto)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndPoint}/${responseProductDto.id}`)
        .send(updateProductDto)
        .expect(200)
      expect(() => {
        expect(body).toEqual(responseProductDto)
        expect(mockProductService.update).toHaveBeenCalledWith(
          responseProductDto.id,
          updateProductDto,
        )
      })
    })
    it("should thrown an error if the product doesn't exist", async () => {
      mockProductService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndPoint}/${responseProductDto.id}`)
        .send(updateProductDto)
        .expect(404)
    })
    it('should throw an error if update request is empty', async () => {
      await request(app.getHttpServer())
        .put(`${myEndPoint}/${responseProductDto.id}`)
        .send(new UpdateProductDto())
        .expect(400)
    })
    it('should throw an error if the ID is invalid', async () => {
      const id: string = '123'
      await request(app.getHttpServer())
        .put(`${myEndPoint}/${id}`)
        .send(updateProductDto)
        .expect(400)
    })
  })

  describe('DELETE /products/:id', () => {
    it('should remove a product', async () => {
      mockProductService.remove.mockResolvedValue(responseProductDto)

      await request(app.getHttpServer())
        .delete(`${myEndPoint}/${responseProductDto.id}`)
        .expect(204)
    })

    it("should throw an error if the product doesn't exist", async () => {
      mockProductService.remove.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndPoint}/${responseProductDto.id}`)
        .expect(404)
    })

    it('should throw an error if the ID is invalid', async () => {
      const id: string = '123'
      await request(app.getHttpServer())
        .delete(`${myEndPoint}/${id}`)
        .expect(400)
    })
  })

  describe('PATCH /products/image/:id', () => {
    it('should update the product image', async () => {
      const file = Buffer.from('file')

      mockProductService.exists.mockResolvedValue(true)

      mockProductService.updateImage.mockResolvedValue(responseProductDto)

      await request(app.getHttpServer())
        .patch(`${myEndPoint}/image/${responseProductDto.id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(200)
    })
    it('should throw an error if the image extension is not allowed', async () => {
      const file = Buffer.from('file')

      await request(app.getHttpServer())
        .patch(`${myEndPoint}/image/${responseProductDto.id}`)
        .attach('file', file, 'image.pdf')
        .set('Content-Type', 'multipart/form-data')
        .expect(400)
    })
    it('should throw an error if the ID is invalid', async () => {
      const file = Buffer.from('file')

      const id: string = '123'
      await request(app.getHttpServer())
        .patch(`${myEndPoint}/image/${id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(400)
    })
    it('should throw an error if the img field is null', async () => {
      await request(app.getHttpServer())
        .patch(`${myEndPoint}/image/${responseProductDto.id}`)
        .attach('file', null)
        .set('Content-Type', 'multipart/form-data')
        .expect(400)
    })
  })
})
