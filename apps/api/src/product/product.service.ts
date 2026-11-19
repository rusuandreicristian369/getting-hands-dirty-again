import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { ProductCouldNotBeReservedError } from './product.errors.js';

interface ReserveProductInput {
    productId: string
    quantity: number;
}


@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product) private readonly repository: Repository<Product>
    ) { }

    async getAll() {
        return this.repository.find()
    }

    async reserve(input: ReserveProductInput, manager: EntityManager) {
        const builder = manager.createQueryBuilder()

        const result = await builder
            .update(Product)
            .set({
                stock: () => "stock - :qty",
            })
            .setParameter("qty", input.quantity)
            .where("id = :id", { id: input.productId })
            .andWhere("stock >= :minStock", { minStock: input.quantity })
            .execute()


        if (!result.affected || result.affected === 0) {
            throw new ProductCouldNotBeReservedError()
        }

    }
}
