import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Store])
    ]
})
export class StoreModule { }
