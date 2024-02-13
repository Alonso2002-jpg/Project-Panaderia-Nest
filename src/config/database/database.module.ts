import * as process from 'process'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Product } from '../../rest/product/entities/product.entity'
import { PersonalEntity } from '../../rest/personal/entities/personal.entity'
import { Category } from '../../rest/category/entities/category.entity'
import { UserRole } from '../../rest/user/entities/user.roles.entity'
import { User } from '../../rest/user/entities/user.entity'
import { ProvidersEntity } from '../../rest/providers/entities/providers.entity'

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
        entities: [
          Product,
          ProvidersEntity,
          Category,
          UserRole,
          User,
          PersonalEntity,
        ], // Cargamos todas las entidades,
        synchronize: process.env.NODE_ENV === 'dev',
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false,
        autoLoadEntities: process.env.NODE_ENV === 'dev',
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log('Postgres database connected', 'DatabaseModule')
          return connection
        },
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: `mongodb://${process.env.DATABASE_USER}:${
          process.env.DATABASE_PASSWORD
        }@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${
          process.env.MONGO_DATABASE
        }`,
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log(
            `MongoDB readyState: ${connection.readyState}`,
            'DatabaseModule',
          )
          return connection
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
