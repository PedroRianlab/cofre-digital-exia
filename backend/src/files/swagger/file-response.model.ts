import { ApiProperty } from '@nestjs/swagger';

export class FileResponseModel {
  @ApiProperty({
    example: '3c45891e-92a2-44d6-a4fb-c2058f5c0ac3',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({ example: 'documento.pdf', maxLength: 255 })
  nomeOriginal!: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string;

  @ApiProperty({ example: 52_480, description: 'Tamanho em bytes.' })
  tamanho!: number;

  @ApiProperty({ example: '2026-10-14T22:00:00.000Z', format: 'date-time' })
  createdAt!: string;
}
