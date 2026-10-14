import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestModel {
  @ApiProperty({
    example: 'usuario@example.com',
    format: 'email',
    maxLength: 254,
  })
  email!: string;

  @ApiProperty({
    example: 'SenhaSegura123',
    format: 'password',
    minLength: 8,
    maxLength: 128,
  })
  senha!: string;
}

export class LoginRequestModel {
  @ApiProperty({
    example: 'usuario@example.com',
    format: 'email',
    maxLength: 254,
  })
  email!: string;

  @ApiProperty({
    example: 'SenhaSegura123',
    format: 'password',
    minLength: 1,
    maxLength: 128,
  })
  senha!: string;
}
