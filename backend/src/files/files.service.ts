import {
  Injectable,
  Logger,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { loadEsm } from 'load-esm';
import { FilesRepository } from './files.repository';
import { FilesStorage } from './files.storage';

const allowedFileTypes = new Set([
  'pdf:application/pdf',
  'mp3:audio/mpeg',
  'wav:audio/wav',
  'ogg:audio/ogg',
  'm4a:audio/x-m4a',
  'png:image/png',
  'jpg:image/jpeg',
  'webp:image/webp',
  'gif:image/gif',
]);

let fileTypeModulePromise: Promise<typeof import('file-type')> | undefined;

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly filesStorage: FilesStorage,
  ) {}

  async upload(userId: string, file: Express.Multer.File) {
    const detectedType = await detectAllowedType(file.buffer);
    const storageKey = randomUUID();

    await this.filesStorage.save(storageKey, file.buffer);

    try {
      return await this.filesRepository.create(userId, {
        nomeOriginal: sanitizeOriginalName(file.originalname),
        mimeType: detectedType.mime,
        tamanho: file.size,
        storageKey,
      });
    } catch (error) {
      await this.removeAfterFailedDatabaseWrite(storageKey);
      throw error;
    }
  }

  findAll(userId: string) {
    return this.filesRepository.findAll(userId);
  }

  async findOne(id: string, userId: string) {
    const file = await this.filesRepository.findById(id, userId);

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    return file;
  }

  async download(id: string, userId: string) {
    const file = await this.filesRepository.findByIdWithStorage(id, userId);

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const stream = await this.filesStorage.open(file.storageKey);
    return { ...file, stream };
  }

  async remove(id: string, userId: string): Promise<void> {
    const file = await this.filesRepository.remove(id, userId);

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    try {
      await this.filesStorage.remove(file.storageKey);
    } catch (error) {
      this.logger.error(
        `Falha ao remover arquivo físico com chave ${file.storageKey}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private async removeAfterFailedDatabaseWrite(storageKey: string) {
    try {
      await this.filesStorage.remove(storageKey);
    } catch (cleanupError) {
      this.logger.error(
        `Falha ao limpar arquivo órfão com chave ${storageKey}`,
        cleanupError instanceof Error
          ? cleanupError.stack
          : String(cleanupError),
      );
    }
  }
}

async function detectAllowedType(buffer: Buffer) {
  const fileTypeModule = await loadFileTypeModule();
  let detectedType: Awaited<
    ReturnType<typeof fileTypeModule.fileTypeFromBuffer>
  >;

  try {
    detectedType = await fileTypeModule.fileTypeFromBuffer(buffer);
  } catch {
    throw new UnsupportedMediaTypeException('Tipo de arquivo não permitido');
  }

  const key = detectedType
    ? `${detectedType.ext}:${detectedType.mime}`
    : undefined;

  if (!detectedType || !key || !allowedFileTypes.has(key)) {
    throw new UnsupportedMediaTypeException('Tipo de arquivo não permitido');
  }

  return detectedType;
}

function loadFileTypeModule() {
  if (!fileTypeModulePromise) {
    fileTypeModulePromise = loadEsm<typeof import('file-type')>('file-type');
  }

  return fileTypeModulePromise;
}

function sanitizeOriginalName(originalName: string): string {
  const basename = originalName.split(/[\\/]/).pop() ?? '';
  const withoutControls = Array.from(basename)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join('')
    .trim();
  const limited = Array.from(withoutControls).slice(0, 255).join('');

  return limited || 'arquivo';
}
