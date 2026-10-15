import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, open, unlink, writeFile } from 'node:fs/promises';
import type { ReadStream } from 'node:fs';
import { resolve } from 'node:path';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class FilesStorage {
  private readonly storageDir: string;

  constructor(configService: ConfigService) {
    this.storageDir = resolve(
      process.cwd(),
      configService.getOrThrow<string>('STORAGE_DIR'),
    );
  }

  async save(storageKey: string, content: Buffer): Promise<void> {
    await this.ensureDirectory();
    await writeFile(this.pathFor(storageKey), content, { flag: 'wx' });
  }

  async open(storageKey: string): Promise<ReadStream> {
    const handle = await open(this.pathFor(storageKey), 'r');
    return handle.createReadStream({ autoClose: true });
  }

  async remove(storageKey: string): Promise<void> {
    try {
      await unlink(this.pathFor(storageKey));
    } catch (error) {
      if (isFileNotFoundError(error)) {
        return;
      }

      throw error;
    }
  }

  private ensureDirectory() {
    return mkdir(this.storageDir, { recursive: true });
  }

  private pathFor(storageKey: string): string {
    if (!UUID_PATTERN.test(storageKey)) {
      throw new InternalServerErrorException('Chave de armazenamento inválida');
    }

    return resolve(this.storageDir, storageKey);
  }
}

function isFileNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}
