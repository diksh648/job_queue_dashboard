import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';

const database = process.env.VERCEL ? ':memory:' : process.env.DATABASE_PATH ?? 'jobs.sqlite';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database,
      autoLoadEntities: true,
      synchronize: true
    }),
    JobsModule
  ]
})
export class AppModule {}
