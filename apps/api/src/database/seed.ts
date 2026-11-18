import { faker } from "@faker-js/faker"
import { INestApplicationContext, Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { DataSource } from "typeorm"
import { AppModule } from "../app.module.js"
import { Tenant } from "../tenant/entities/tenant.entity.js"
import { withTime } from "../utils/performance.js"

const types = ["seed", "clean"]

const CONFIG = {
    batchSize: 10000,

    tenants: {
        count: 1000000
    }
}

function* batch(count: number) {
    for (let done = 0; done < count; done += CONFIG.batchSize) {
        const size = Math.min(CONFIG.batchSize, count - CONFIG.batchSize)

        yield size
    }
}

async function seed(app: INestApplicationContext) {
    const dataSource = app.get(DataSource)

    const logger = new Logger("clean")

    await clean(app)

    const { time } = await withTime(async () => {
        await dataSource.transaction(async (manager) => {
            logger.log("Creating tenants...")

            for (const size of batch(CONFIG.tenants.count)) {
                const tenants = new Array(size).fill(null).map(() => manager.create(Tenant, {
                    name: faker.person.fullName()
                }))
                await manager.insert(Tenant, tenants)
            }


        })
    })
    logger.debug(`Seeding took: ${time}s`)


    logger.log("Done the seed!")
}

async function clean(app: INestApplicationContext) {
    const dataSource = app.get(DataSource)

    const logger = new Logger("clean")

    const queryRunner = dataSource.createQueryRunner()
    try {
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`)
        for (const entity of dataSource.entityMetadatas) {
            if (entity.tableType === 'view') {
                continue;
            }

            logger.log(`Deleting ${entity.tableName}...`)
            await queryRunner.clearTable(entity.tableName)
        }

        logger.log(`Finished!`)
    }
    finally {
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`)
        await queryRunner.release()
    }
}

async function bootstrap() {
    const type = process.argv[2]
    if (!types.includes(type)) {
        throw new Error(`Invalid type. Accepted: ${types.join(", ")}`)
    }

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['log', 'debug']
    })

    const logger = new Logger()

    logger.log(`Running the "${type}" operation on the database...`)

    if (type === "seed") {
        await seed(app)
    } else if (type === "clean") {
        await clean(app)
    }


    await app.close()
}

bootstrap()
