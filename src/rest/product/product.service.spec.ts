import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import {Category} from "../category/entities/category.entity";
import {ProvidersEntity} from "../providers/entities/providers.entity";
import {Product} from "./entities/product.entity";
import {Repository} from "typeorm";
import {StorageService} from "../storage/storage.service";
import {ProductMapper} from "./mappers/product-mapper";
import {NotificationGateway} from "../../websockets/notification/notification.gateway";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {ResponseProductDto} from "./dto/response-product.dto";
import {Paginated} from "nestjs-paginate";
import { Cache } from 'cache-manager'
import {hash} from "typeorm/util/StringUtils";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {CreateProductDto} from "./dto/create-product.dto";
import {UpdateProductDto} from "./dto/update-product.dto";

describe('ProductService', () => {
  let service: ProductService;
  let productRepository : Repository<Product>
  let categoryRepository : Repository<Category>
  let providerRepository : Repository<ProvidersEntity>
  let mapper: ProductMapper
  let storageService : StorageService
  let notificationGateway : NotificationGateway
  let cacheManager : Cache

  const productMapperMock = {
    toProductCreate: jest.fn(),
    toProductUpdate: jest.fn(),
    toProductResponse : jest.fn(),
  }

  const storageServiceMock = {
    removeFile : jest.fn(),
  }

  const notificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService,
        {provide: getRepositoryToken(Product), useClass: Repository},
        {provide: getRepositoryToken(Category), useClass: Repository},
        {provide: getRepositoryToken(ProvidersEntity), useClass: Repository},
        {provide: ProductMapper, useValue: productMapperMock},
        {provide: StorageService, useValue: storageServiceMock},
        {provide: NotificationGateway, useValue: notificationsGatewayMock},
        {provide: CACHE_MANAGER, useValue: cacheManagerMock},
      ],
    }).compile();

    service = module.get<ProductService>(ProductService)
    productRepository = module.get(getRepositoryToken(Product))
    categoryRepository = module.get(getRepositoryToken(Category))
    providerRepository = module.get(getRepositoryToken(ProvidersEntity))
    mapper = module.get<ProductMapper>(ProductMapper)
    storageService = module.get<StorageService>(StorageService)
    notificationGateway = module.get<NotificationGateway>(NotificationGateway)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated array of products response from database', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'products'
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(mapper, 'toProductResponse')
          .mockReturnValue(new ResponseProductDto())

      const result: any = await service.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
          `products?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`
      )
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    });

    it('should return a paginated array of products response from cache', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'products'
      }

      const testProducts = {
        data : [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links : {
          current: 'products?page=1&limit=10&sortBy=id:ASC',
        },
      } as Paginated <ResponseProductDto>

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(testProducts))

      const result: any = await service.findAll(paginateOptions)

      expect(cacheManager.get).toHaveBeenCalledWith(`all_products_page_${hash(JSON.stringify(paginateOptions))}`)
      expect(result).toEqual(testProducts)
    });

  })

  describe('findOne', () => {
    it('should retrieve a product by id from database', async () => {
      const result = new Product()
      const resultDto = new ResponseProductDto()
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(result),
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(resultDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.findOne("5c9d94ac-344f-4992-a714-4243b0787263")).toEqual(resultDto)
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(cacheManager.get).toHaveBeenCalledWith("product_5c9d94ac-344f-4992-a714-4243b0787263")
      expect(cacheManager.set).toHaveBeenCalled()
    })

    it('should retrieve a product by id from cache', async () => {
      const resultDto = new ResponseProductDto()
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(resultDto))

      expect(await service.findOne("5c9d94ac-344f-4992-a714-4243b0787263")).toEqual(resultDto)
      expect(cacheManager.get).toHaveBeenCalledWith('product_5c9d94ac-344f-4992-a714-4243b0787263')
    })

    it('should throw an  error if the product doesn`t exist in database', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

      await expect(service.findOne("5c9d94ac-344f-4992-a714-4243b0787263")).rejects.toThrow(NotFoundException)
    })

    it('should throw an  error if the product but isDeteled is true', async () => {
      const product = new Product();
      product.isDeleted = true;
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

      await expect(service.findOne("5c9d94ac-344f-4992-a714-4243b0787263")).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new product', async () => {
      const category : Category = new Category();
      const provider : ProvidersEntity = new ProvidersEntity();
      const product : Product = new Product();
      const productCreateDto: CreateProductDto = new CreateProductDto();
      productCreateDto.name = "Test"
      productCreateDto.category = "Category test"
      productCreateDto.provider = "Provider test"
      const resultDto : ResponseProductDto = new ResponseProductDto();
      const mockQueryBuilderCategory = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category)
      }
      const mockQueryBuilderProvider = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(provider)
      }
      const mockQueryBuilderProduct = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined)
      }
      jest.spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)

      jest.spyOn(providerRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProvider as any)

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)

      jest.spyOn(mapper, 'toProductCreate').mockReturnValue(product);
      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(resultDto);
      jest.spyOn(productRepository, 'save').mockResolvedValue(product);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.create(productCreateDto)).toEqual(resultDto)
      expect(mapper.toProductCreate).toHaveBeenCalled()
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(productRepository.save).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })

    it('should create a new product when already exist a product with same name but isDeleted is true', async () => {
      const category : Category = new Category();
      const provider : ProvidersEntity = new ProvidersEntity();
      const product : Product = new Product();
      const actualProduct : Product = new Product();
      actualProduct.isDeleted = true;
      const productCreateDto: CreateProductDto = new CreateProductDto();
      productCreateDto.name = "Test"
      productCreateDto.category = "Category test"
      productCreateDto.provider = "Provider test"
      const resultDto : ResponseProductDto = new ResponseProductDto();
      const mockQueryBuilderCategory = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category)
      }
      const mockQueryBuilderProvider = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(provider)
      }
      const mockQueryBuilderProduct = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(actualProduct)
      }
      jest.spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)

      jest.spyOn(providerRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProvider as any)

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)

      jest.spyOn(mapper, 'toProductCreate').mockReturnValue(product);
      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(resultDto);
      jest.spyOn(productRepository, 'save').mockResolvedValue(product);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.create(productCreateDto)).toEqual(resultDto)
      expect(mapper.toProductCreate).toHaveBeenCalled()
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(productRepository.save).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })

    it('should throw an error if already exist a product but isDeleted is false', async () => {
      const createProductDto = new CreateProductDto();
      createProductDto.name = "Test Product";
      const product = new Product();
      product.isDeleted = false;
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
          .spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

      await expect(service.create(createProductDto)).rejects.toThrow(BadRequestException);
    })

    it('should throw an error if category doesn`t exist', async () => {
      const createProductDto = new CreateProductDto();
      createProductDto.name = "Test Product";
      createProductDto.category = "Test Category";
      const product = new Product();
      product.isDeleted = true;

      const mockQueryBuilderProduct = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      const mockQueryBuilderCategory = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }

      jest
          .spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)

      jest
          .spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)

      await expect(service.create(createProductDto)).rejects.toThrow(BadRequestException);
    })

    it('should throw an error if category exist but isDeleted is true', async () => {
      const createProductDto = new CreateProductDto();
      createProductDto.name = "Test Product";
      createProductDto.category = "Test Category";
      const product = new Product();
      product.isDeleted = true;
      const category : Category = new Category();
      category.isDeleted = true;

      const mockQueryBuilderProduct = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      const mockQueryBuilderCategory = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
          .spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)
      jest
          .spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)

      await expect(service.create(createProductDto)).rejects.toThrow(BadRequestException);
    })

    it('should throw an error if provider doesn`t exist', async () => {
      const createProductDto = new CreateProductDto();
      createProductDto.name = "Test Product";
      createProductDto.category = "Test Category";
      const product = new Product();
      product.isDeleted = true;
      const category : Category = new Category();

      const mockQueryBuilderProduct = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      const mockQueryBuilderCategory = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }
      const mockQueryBuilderProvider = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }

      jest
          .spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)
      jest
          .spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)
      jest
          .spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProvider as any)

      await expect(service.create(createProductDto)).rejects.toThrow(BadRequestException);
    })
  })

  describe('update', () => {
    it('should update an existing product with an updated request when exist a product without isDeleted attribute', async () => {
      const updateProductDto : UpdateProductDto = new UpdateProductDto();
      const actualProduct: Product = new Product();
      const updatedProduct : Product = new Product();
      const result: ResponseProductDto = new ResponseProductDto();

      const mockQueryBuilderProduct = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(actualProduct)
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)
      jest.spyOn(mapper, 'toProductUpdate').mockReturnValue(updatedProduct);
      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(result);
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

      expect(await service.update("5c9d94ac-344f-4992-a714-4243b0787263", updateProductDto)).toEqual(result)
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(mapper.toProductUpdate).toHaveBeenCalled()
      expect(productRepository.save).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })

    it('should update an existing product with an updated request when exist a product with isDeleted false', async () => {
      const updateProductDto : UpdateProductDto = new UpdateProductDto();
      const actualProduct: Product = new Product();
      actualProduct.isDeleted = false;
      const updatedProduct : Product = new Product();
      const result: ResponseProductDto = new ResponseProductDto();

      const mockQueryBuilderProduct = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(actualProduct)
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)
      jest.spyOn(mapper, 'toProductUpdate').mockReturnValue(updatedProduct);
      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(result);
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

      expect(await service.update("5c9d94ac-344f-4992-a714-4243b0787263", updateProductDto)).toEqual(result)
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(mapper.toProductUpdate).toHaveBeenCalled()
      expect(productRepository.save).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })

    it('should update an existing product with an updated request when we want to change category and it exists', async () => {
      const category: Category = new Category();
      category.nameCategory = 'Category test'
      const updateProductDto : UpdateProductDto = new UpdateProductDto();
      updateProductDto.category = 'Category test'
      const actualProduct: Product = new Product();
      const updatedProduct : Product = new Product();
      const result: ResponseProductDto = new ResponseProductDto();

      const mockQueryBuilderProduct = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(actualProduct)
      }

      const mockQueryBuilderCategory = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category)
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)

      jest.spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)

      jest.spyOn(mapper, 'toProductUpdate').mockReturnValue(updatedProduct);
      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(result);
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

      expect(await service.update("5c9d94ac-344f-4992-a714-4243b0787263", updateProductDto)).toEqual(result)
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(mapper.toProductUpdate).toHaveBeenCalled()
      expect(productRepository.save).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })

    it('should update an existing product with an updated request when we want to change provider and it exists', async () => {
      const provider: ProvidersEntity = new ProvidersEntity();
      provider.NIF = 'Category test'
      const updateProductDto : UpdateProductDto = new UpdateProductDto();
      updateProductDto.category = 'Category test'
      const actualProduct: Product = new Product();
      const updatedProduct : Product = new Product();
      const result: ResponseProductDto = new ResponseProductDto();

      const mockQueryBuilderProduct = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(actualProduct)
      }

      const mockQueryBuilderCategory = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category)
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderProduct as any)

      jest.spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilderCategory as any)

      jest.spyOn(mapper, 'toProductUpdate').mockReturnValue(updatedProduct);
      jest.spyOn(mapper, 'toProductResponse').mockReturnValue(result);
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

      expect(await service.update("5c9d94ac-344f-4992-a714-4243b0787263", updateProductDto)).toEqual(result)
      expect(mapper.toProductResponse).toHaveBeenCalled()
      expect(mapper.toProductUpdate).toHaveBeenCalled()
      expect(productRepository.save).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })













  })























  describe('remove', () => {
    it('should remove a product by updating isDeleted to true', async () => {
      const productToDelete = new Product();
      productToDelete.isDeleted = false;
      const result : ResponseProductDto = new ResponseProductDto();
      result.isDeleted = true;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(productToDelete),
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(productToDelete);
      jest.spyOn(productMapperMock, 'toProductResponse').mockReturnValue(result);

      const actualResult = await service.remove("5c9d94ac-344f-4992-a714-4243b0787263");

      expect(actualResult.isDeleted).toBeTruthy();
      expect(productRepository.save).toHaveBeenCalled()
      expect(productMapperMock.toProductResponse).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled();
    })

    it('should throw an error if product doesn`t exist', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any);

      await expect(service.remove("5c9d94ac-344f-4992-a714-4243b0787263")).rejects.toThrow(NotFoundException)
    })

    it('should throw an error if product exist but isDeleted is true', async () => {
      const product : Product = new Product();
      product.isDeleted = true;
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }

      jest.spyOn(productRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any);

      await expect(service.remove("5c9d94ac-344f-4992-a714-4243b0787263")).rejects.toThrow(NotFoundException)
    })

    it('should remove a recovered product from cache by updating isDeleted to true', async () => {
      const productToDelete = new Product();
      productToDelete.isDeleted = false;
      let result : ResponseProductDto = new ResponseProductDto();
      result.isDeleted = true;

      jest
          .spyOn(cacheManager, 'get')
          .mockResolvedValue(Promise.resolve(productToDelete))

      jest.spyOn(productRepository, 'save').mockResolvedValue(productToDelete);
      jest.spyOn(productMapperMock, 'toProductResponse').mockReturnValue(result);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      const actualResult = await service.remove("5c9d94ac-344f-4992-a714-4243b0787263");

      expect(actualResult.isDeleted).toBeTruthy();
      expect(productRepository.save).toHaveBeenCalled()
      expect(productMapperMock.toProductResponse).toHaveBeenCalled()
      expect(notificationGateway.sendMessage).toHaveBeenCalled();
    })
  })
});
