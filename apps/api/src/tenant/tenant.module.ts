import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity.js';
import { TenantController } from './tenant.controller.js';
import { TenantService } from './tenant.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant])
  ],
  providers: [TenantService],
  controllers: [TenantController]
})
export class TenantModule { }
