import { faker } from "@faker-js/faker";
import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Tenant } from "../../src/tenant/entities/tenant.entity.js";
import { withTime } from "../../src/utils/performance.js";
import { createFactories } from "./factories/create.js";

const CONFIG = {
    batchSize: 10000,

    tenants: {
        count: 1
    },

    products: {
        count: 1
    }
}

@Injectable()
export class TestDatabaseService {
    readonly factories: ReturnType<typeof createFactories>;

    private readonly logger = new Logger(this.constructor.name)

    constructor(
        private readonly dataSource: DataSource
    ) {
        this.factories = createFactories(this.dataSource)
    }

    private *batch(count: number) {
        for (let done = 0; done < count; done += CONFIG.batchSize) {
            const size = Math.min(CONFIG.batchSize, count - done)

            yield size
        }
    }

    async seed() {
        await this.clean()

        const { time } = await withTime(async () => {
            await this.dataSource.transaction(async (manager) => {
                this.logger.log("Creating tenants...")

                for (const size of this.batch(CONFIG.tenants.count)) {
                    const tenants = new Array(size).fill(null).map(() => manager.create(Tenant, {
                        name: faker.person.fullName(),
                        store: {
                            products: [
                                {
                                    stock: 1
                                }
                            ]
                        }
                    }))

                    await manager.save(Tenant, tenants)
                }


            })
        })
        this.logger.debug(`Seeding took: ${time}s`)


        this.logger.log("Done the seed!")
    }

    async clean() {
        const queryRunner = this.dataSource.createQueryRunner()
        try {
            await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`)
            for (const entity of this.dataSource.entityMetadatas) {
                if (entity.tableType === 'view') {
                    continue;
                }

                this.logger.log(`Deleting ${entity.tableName}...`)
                await queryRunner.clearTable(entity.tableName)
            }

            this.logger.log(`Finished!`)
        }
        finally {
            await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`)
            await queryRunner.release()
        }
    }
}