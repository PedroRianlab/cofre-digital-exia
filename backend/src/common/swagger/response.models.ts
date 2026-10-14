import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ValidationFieldModel {
  @ApiProperty({ example: 'titulo' })
  field!: string;

  @ApiProperty({ example: 'Too big: expected string to have <=120 characters' })
  message!: string;
}

export class ErrorResponseModel {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Dados inválidos' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  message!: string | string[];

  @ApiProperty({ example: '/notes' })
  path!: string;

  @ApiProperty({ example: '2026-10-13T17:00:00.000Z', format: 'date-time' })
  timestamp!: string;

  @ApiPropertyOptional({ type: [ValidationFieldModel] })
  fields?: ValidationFieldModel[];
}

export class RegisterResponseModel {
  @ApiProperty({
    example: '3c45891e-92a2-44d6-a4fb-c2058f5c0ac3',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({ example: 'usuario@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: '2026-10-13T17:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-13T17:00:00.000Z', format: 'date-time' })
  updatedAt!: string;
}

export class LoginResponseModel {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;
}

export class NoteResponseModel {
  @ApiProperty({
    example: '3c45891e-92a2-44d6-a4fb-c2058f5c0ac3',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({ example: 'Plano de estudos' })
  titulo!: string;

  @ApiProperty({ example: 'Revisar NestJS e PostgreSQL.' })
  conteudo!: string;

  @ApiProperty({ example: 'Estudos', nullable: true, type: String })
  categoria!: string | null;

  @ApiProperty({ example: '2026-10-13T17:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-13T17:00:00.000Z', format: 'date-time' })
  updatedAt!: string;
}
