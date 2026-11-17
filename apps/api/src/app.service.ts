import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm'

@Injectable()
export class AppService {
  private readonly logger = new Logger(this.constructor.name)

  constructor(
    private readonly dataSource: DataSource
  ) {}

  async getHello(): Promise<string> {
    this.logger.log("Hello!")

    const result = await this.dataSource.query("SELECT 1")

    console.log({result})

    return 'Hello World!';
  }
}
