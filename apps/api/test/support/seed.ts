import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "../../src/app.module.js"
import { TestDatabaseService } from "./test-database.service.js"

const types = ["seed", "clean"]


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

    const testDatabaseService = app.get(TestDatabaseService)


    if (type === "seed") {
        await testDatabaseService.seed()
    } else if (type === "clean") {
        await testDatabaseService.clean()
    }


    await app.close()
}

await bootstrap()
