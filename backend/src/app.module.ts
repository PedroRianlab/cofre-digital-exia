import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './common/config/env.schema';
import { PrismaModule } from './common/prisma/prisma.module';
import { FilesModule } from './files/files.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NotesModule,
    FilesModule,
  ],
})
export class AppModule {}
