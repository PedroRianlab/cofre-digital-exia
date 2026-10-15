import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  JwtModule,
  type JwtModuleOptions,
  type JwtSignOptions,
} from '@nestjs/jwt';
import {
  ThrottlerGuard,
  ThrottlerModule,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const ttl = configService.getOrThrow<number>('AUTH_THROTTLE_TTL_MS');

        return [
          {
            name: 'global',
            ttl: configService.getOrThrow<number>('GLOBAL_THROTTLE_TTL_MS'),
            limit: configService.getOrThrow<number>('GLOBAL_THROTTLE_LIMIT'),
          },
          {
            name: 'login',
            ttl,
            limit: configService.getOrThrow<number>('LOGIN_THROTTLE_LIMIT'),
          },
          {
            name: 'register',
            ttl,
            limit: configService.getOrThrow<number>('REGISTER_THROTTLE_LIMIT'),
          },
          {
            name: 'upload',
            ttl: configService.getOrThrow<number>('UPLOAD_THROTTLE_TTL_MS'),
            limit: configService.getOrThrow<number>('UPLOAD_THROTTLE_LIMIT'),
            skipIf: (context) =>
              context.getClass().name !== 'FilesController' ||
              context.getHandler().name !== 'upload',
          },
        ];
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: configService.getOrThrow<string>(
            'JWT_EXPIRES_IN',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
