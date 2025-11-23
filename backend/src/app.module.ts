import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { ScheduleModule as AppScheduleModule } from './modules/schedule/schedule.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { LlmModule } from './services/llm/llm.module';
import { IngestionModule } from './services/ingestion/ingestion.module';
import { JobsModule } from './jobs/jobs.module';
import { TwitterModule } from './services/twitter/twitter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DATABASE_TYPE', 'sqlite'),
        database: configService.get<string>('DATABASE_PATH', 'data/borgpost.db'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PostsModule,
    CategoriesModule,
    PromptsModule,
    AppScheduleModule,
    AnalyticsModule,
    ConfigurationModule,
    LlmModule,
    IngestionModule,
    JobsModule,
    TwitterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
