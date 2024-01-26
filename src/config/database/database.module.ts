import * as process from 'process'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Category } from '../../rest/category/entities/category.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        entities: [Category],
        synchronize: process.env.NODE_ENV === 'dev',
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false,
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log('Postgres database connected', 'DatabaseModule')
          return connection
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
