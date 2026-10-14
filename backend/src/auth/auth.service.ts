import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import type { LoginInput } from './schemas/login.schema';
import type { RegisterInput } from './schemas/register.schema';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} satisfies argon2.HashOptions;

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyPasswordHash = '';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Criado uma vez para igualar o trabalho do login quando o e-mail nao existe.
    this.dummyPasswordHash = await argon2.hash(
      'senha-falsa-para-verificacao',
      ARGON2_OPTIONS,
    );
  }

  async register(input: RegisterInput) {
    const senhaHash = await argon2.hash(input.senha, ARGON2_OPTIONS);
    const user = await this.usersService.create(input.email, senhaHash);

    if (!user) {
      throw new ConflictException('E-mail já cadastrado');
    }

    return user;
  }

  async login(input: LoginInput) {
    const user = await this.usersService.findByEmailForAuth(input.email);
    const hashToVerify = user?.senhaHash ?? this.dummyPasswordHash;
    const passwordMatches = await argon2.verify(hashToVerify, input.senha);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('credenciais inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
