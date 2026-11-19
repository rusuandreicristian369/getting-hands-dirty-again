import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buyer } from './entities/buyer.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Buyer])]
})
export class BuyerModule { }
