import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteRequestModel {
  @ApiProperty({ example: 'Plano de estudos', minLength: 1, maxLength: 120 })
  titulo!: string;

  @ApiProperty({ example: 'Revisar NestJS e PostgreSQL.', maxLength: 10_000 })
  conteudo!: string;

  @ApiPropertyOptional({ example: 'Estudos', minLength: 1, maxLength: 50 })
  categoria?: string;
}

export class UpdateNoteRequestModel {
  @ApiPropertyOptional({
    description: 'Envie ao menos um dos campos do modelo.',
    example: 'Plano atualizado',
    minLength: 1,
    maxLength: 120,
  })
  titulo?: string;

  @ApiPropertyOptional({ example: 'Conteúdo atualizado.', maxLength: 10_000 })
  conteudo?: string;

  @ApiPropertyOptional({ example: 'Trabalho', minLength: 1, maxLength: 50 })
  categoria?: string;
}
