import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

const publicFileSelect = {
  id: true,
  nomeOriginal: true,
  mimeType: true,
  tamanho: true,
  createdAt: true,
} as const;

type CreateFileData = {
  nomeOriginal: string;
  mimeType: string;
  tamanho: number;
  storageKey: string;
};

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: CreateFileData) {
    return this.prisma.arquivo.create({
      data: { ...data, userId },
      select: publicFileSelect,
    });
  }

  findAll(userId: string) {
    return this.prisma.arquivo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: publicFileSelect,
    });
  }

  findById(id: string, userId: string) {
    return this.prisma.arquivo.findFirst({
      where: { id, userId },
      select: publicFileSelect,
    });
  }

  findByIdWithStorage(id: string, userId: string) {
    return this.prisma.arquivo.findFirst({
      where: { id, userId },
      select: {
        nomeOriginal: true,
        mimeType: true,
        storageKey: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const file = await this.prisma.arquivo.findFirst({
      where: { id, userId },
      select: { storageKey: true },
    });

    if (!file) {
      return null;
    }

    const result = await this.prisma.arquivo.deleteMany({
      where: { id, userId },
    });

    return result.count > 0 ? file : null;
  }
}
