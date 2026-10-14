import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ErrorResponseModel,
  LoginResponseModel,
  RegisterResponseModel,
} from '../common/swagger/response.models';
import { AuthService } from './auth.service';
import { loginSchema, type LoginInput } from './schemas/login.schema';
import { registerSchema, type RegisterInput } from './schemas/register.schema';
import {
  LoginRequestModel,
  RegisterRequestModel,
} from './swagger/auth-request.models';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SkipThrottle({ global: true, login: true })
  @ApiOperation({ summary: 'Cadastrar usuário' })
  @ApiBody({ type: RegisterRequestModel })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado.',
    type: RegisterResponseModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail já cadastrado.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 429,
    description: 'Limite de cadastros excedido.',
    type: ErrorResponseModel,
  })
  register(@Body(new ZodValidationPipe(registerSchema)) input: RegisterInput) {
    return this.authService.register(input);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ global: true, register: true })
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({ type: LoginRequestModel })
  @ApiResponse({
    status: 200,
    description: 'Login realizado.',
    type: LoginResponseModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 429,
    description: 'Limite de tentativas excedido. Aguarde 60 segundos.',
    type: ErrorResponseModel,
  })
  login(@Body(new ZodValidationPipe(loginSchema)) input: LoginInput) {
    return this.authService.login(input);
  }
}
