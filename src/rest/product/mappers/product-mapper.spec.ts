import {ProductMapper} from "./product-mapper";
import {Category} from "../../category/entities/category.entity";
import {ProvidersEntity} from "../../providers/entities/providers.entity";
import {Product} from "../entities/product.entity";
import {Test, TestingModule} from "@nestjs/testing";
import {CreateProductDto} from "../dto/create-product.dto";
import {UpdateProductDto} from "../dto/update-product.dto";
import {ResponseProductDto} from "../dto/response-product.dto";


describe('ProductMapper', () => {
    let productMapper: ProductMapper

    const categoryProduct : Category = {
        id: 1,
        nameCategory: 'Product Category',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        products: [],
        providers: [],
        personal: [],
    }

    const categoryProduct2 : Category = {
        id: 2,
        nameCategory: 'Product Category 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        products: [],
        providers: [],
        personal: [],
    }

    const categoryProvider : Category = {
        id: 3,
        nameCategory: 'Provider Category',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        products: [],
        providers: [],
        personal: [],
    }

    const provider : ProvidersEntity = {
        id: 1,
        NIF: "A29268166",
        number: "722668531",
        name: "Product Provider 1",
        CreationDate: new Date(),
        UpdateDate: new Date(),
        type: categoryProvider,
        products: []
    }

    const provider2 : ProvidersEntity = {
        id: 2,
        NIF: "A29268165",
        number: "622668531",
        name: "Product Provider 2",
        CreationDate: new Date(),
        UpdateDate: new Date(),
        type: categoryProvider,
        products: []
    }

    const createProductDto: CreateProductDto = {
        name: 'Pan de Barra',
        price: 1.99,
        stock: 60,
        category: categoryProduct.nameCategory,
        provider: provider.name,
    }

    const updateProductDto: UpdateProductDto = {
        name: 'Pan de Leche',
        price: 2.99,
        stock: 30,
        category: "Product Category 2",
        provider: "Product Provider 2",
        isDeleted: true,
    }

    const product : Product = {
        id: "5c9d94ac-344f-4992-a714-4243b0787263",
        name: "Pan de Barra",
        price: 1.99,
        stock: 60,
        image: "ejemplo.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: categoryProduct,
        provider: provider,
        isDeleted: false,
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductMapper]
        }).compile()

        productMapper = module.get<ProductMapper>(ProductMapper)
    })

    it('should be defined', () =>{
        expect(productMapper).toBeDefined()
    })

    it('should map createProductDto to Product', () =>{
        const newProduct : Product = productMapper.toProductCreate(createProductDto, categoryProduct, provider);

        expect(newProduct).toBeInstanceOf(Product);
        expect(newProduct.id).toBeUndefined()
        expect(newProduct.name).toEqual(createProductDto.name);
        expect(newProduct.price).toEqual(createProductDto.price);
        expect(newProduct.stock).toEqual(createProductDto.stock);
        expect(newProduct.image).toEqual(Product.IMAGE_DEFAULT);
        expect(newProduct.createdAt).toBeDefined();
        expect(newProduct.updatedAt).toBeDefined();
        expect(newProduct.category).toEqual(categoryProduct);
        expect(newProduct.provider).toEqual(provider)
        expect(newProduct.isDeleted).toBeFalsy();
    })

    it('should map updateProductDto to Product', () =>{
        const updatedProduct : Product = productMapper.toProductUpdate(updateProductDto, product, categoryProduct2, provider2);

        expect(updatedProduct).toBeInstanceOf(Product);
        expect(updatedProduct.id).toEqual(product.id)
        expect(updatedProduct.name).toEqual(updateProductDto.name);
        expect(updatedProduct.price).toEqual(updateProductDto.price);
        expect(updatedProduct.stock).toEqual(updateProductDto.stock);
        expect(updatedProduct.image).toEqual(product.image);
        expect(updatedProduct.createdAt).toEqual(product.createdAt);
        expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(product.updatedAt.getTime());
        expect(updatedProduct.category).toEqual(categoryProduct2);
        expect(updatedProduct.provider).toEqual(provider2)
        expect(updatedProduct.isDeleted).toBeTruthy();
    })

    it('should map Product to ResponseProductDto', () =>{
        const response : ResponseProductDto = productMapper.toProductResponse(product);

        expect(response).toBeInstanceOf(ResponseProductDto);
        expect(response.id).toEqual(product.id)
        expect(response.name).toEqual(product.name);
        expect(response.price).toEqual(product.price);
        expect(response.stock).toEqual(product.stock);
        expect(response.image).toEqual(`https://localhost:3000/v1/storage/${product.image}`);
        expect(response.category).toEqual(product.category.nameCategory);
        expect(response.provider).toEqual(product.provider.NIF)
        expect(response.isDeleted).toEqual(product.isDeleted);
    })


})
