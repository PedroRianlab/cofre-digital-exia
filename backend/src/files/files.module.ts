import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthModule } from '../auth/auth.module';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';
import { FilesStorage } from './files.storage';

@Module({
  imports: [
    AuthModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: memoryStorage(),
        defParamCharset: 'utf8',
        limits: {
          fileSize:
            configService.getOrThrow<number>('MAX_UPLOAD_MB') * 1024 * 1024,
          files: 1,
          fields: 0,
          parts: 1,
        },
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, FilesRepository, FilesStorage],
})
export class FilesModule {}
