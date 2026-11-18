import { faker } from "@faker-js/faker"
import { INestApplicationContext, Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { DataSource } from "typeorm"
import { AppModule } from "../app.module.js"
import { Tenant } from "../tenant/entities/tenant.entity.js"

const types = ["seed", "clean"]

async function seed(app: INestApplicationContext) {
    const dataSource = app.get(DataSource)

    const logger = new Logger("clean")

    await clean(app)

    await dataSource.transaction(async (manager) => {
        logger.log("Creating tenants...")

        const tenants = new Array(100).fill(null).map(() => manager.create(Tenant, {
            name: faker.person.fullName()
        }))
        await manager.save(tenants)
    })
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
        logger: ['log']
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
