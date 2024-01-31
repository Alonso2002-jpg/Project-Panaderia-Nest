import {Injectable} from "@nestjs/common";
import {Product} from "../entities/product.entity";
import {CreateProductDto} from "../dto/create-product.dto";
import {Category} from "../../category/entities/category.entity";
import {UpdateProductDto} from "../dto/update-product.dto";
import {ResponseProductDto} from "../dto/response-product.dto";
import {ProvidersEntity} from "../../Providers/entities/Providers.entity";
import * as process from 'process'

@Injectable()
export class ProductMapper {
    toProductCreate( createProductDto : CreateProductDto, category : Category, provider : ProvidersEntity) : Product {
        const newProduct = new Product();
        newProduct.name = createProductDto.name;
        newProduct.price = createProductDto.price;
        newProduct.stock = createProductDto.stock;
        newProduct.image = Product.IMAGE_DEFAULT;
        newProduct.createdAt = new Date();
        newProduct.updatedAt = new Date();
        newProduct.category = category;
        newProduct.provider = provider;
        newProduct.isDeleted = false;
        return newProduct;
    }

    toProductUpdate(updateProductDto: UpdateProductDto, actualProduct : Product, category: Category, provider: ProvidersEntity) : Product {
        const updatedProduct = new Product();
        updatedProduct.id = actualProduct.id;
        updatedProduct.name = updateProductDto.name ?? actualProduct.name;
        updatedProduct.price = updateProductDto.price ?? actualProduct.price;
        updatedProduct.stock = updateProductDto.stock ?? actualProduct.stock;
        updatedProduct.image = actualProduct.image;
        updatedProduct.createdAt = actualProduct.createdAt;
        updatedProduct.updatedAt = new Date();
        updatedProduct.category = category;
        updatedProduct.provider = provider;
        updatedProduct.isDeleted = updateProductDto.isDeleted != null ? updateProductDto.isDeleted : actualProduct.isDeleted;
        return updatedProduct;
    }

    toProductResponse(product : Product) : ResponseProductDto {
        const response : ResponseProductDto = new ResponseProductDto();
        response.id = product.id;
        response.name = product.name;
        response.price = product.price;
        response.stock = product.stock;
        response.image = product.image == Product.IMAGE_DEFAULT
            ? product.image :
            `${process.env.API_PROTOCOL || 'https'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3000'}/${process.env.API_VERSION || 'v1'}/storage/${product.image}`
        response.category = product.category?.nameCategory ?? null;
        response.provider = product.provider?.NIF ?? null;
        response.isDeleted = product.isDeleted;
        return response;
    }
}