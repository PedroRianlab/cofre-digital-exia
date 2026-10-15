import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CreateNoteInput } from './schemas/create-note.schema';
import type { UpdateNoteInput } from './schemas/update-note.schema';

const noteSelect = {
  id: true,
  titulo: true,
  conteudo: true,
  categoria: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, input: CreateNoteInput) {
    return this.prisma.note.create({
      data: { ...input, userId },
      select: noteSelect,
    });
  }

  findAll(userId: string, categoria?: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        ...(categoria !== undefined && {
          categoria: { equals: categoria, mode: 'insensitive' as const },
        }),
      },
      orderBy: { updatedAt: 'desc' },
      select: noteSelect,
    });
  }

  findById(id: string, userId: string) {
    return this.prisma.note.findFirst({
      where: { id, userId },
      select: noteSelect,
    });
  }

  async update(id: string, userId: string, input: UpdateNoteInput) {
    const result = await this.prisma.note.updateMany({
      where: { id, userId },
      data: input,
    });

    if (result.count === 0) {
      return null;
    }

    return this.prisma.note.findFirst({
      where: { id, userId },
      select: noteSelect,
    });
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.note.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }
}
