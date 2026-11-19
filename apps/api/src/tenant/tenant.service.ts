import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity.js';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Tenant) private readonly repository: Repository<Tenant>
    ) {

    }

}
