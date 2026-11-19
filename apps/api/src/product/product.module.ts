import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { ProductService } from './product.service.js';
import { ProductController } from './product.controller.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product])
    ],
    exports: [ProductService],
    providers: [ProductService],
    controllers: [ProductController]
})
export class ProductModule { }
