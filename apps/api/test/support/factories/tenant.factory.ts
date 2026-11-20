import { faker } from '@faker-js/faker';
import { FactorizedAttrs, Factory } from '@jorgebodega/typeorm-factory';
import { DataSource } from 'typeorm';
import { Tenant } from '../../../src/tenant/entities/tenant.entity.js';

export class TenantFactory extends Factory<Tenant> {
    protected entity = Tenant

    constructor(protected dataSource: DataSource) { super() }

    protected attrs(): FactorizedAttrs<Tenant> {
        return {
            name: faker.company.name()
        }
    }
}