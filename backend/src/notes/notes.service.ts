import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import type { CreateNoteInput } from './schemas/create-note.schema';
import type { UpdateNoteInput } from './schemas/update-note.schema';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  create(userId: string, input: CreateNoteInput) {
    return this.notesRepository.create(userId, input);
  }

  findAll(userId: string) {
    return this.notesRepository.findAll(userId);
  }

  async findOne(id: string, userId: string) {
    const note = await this.notesRepository.findById(id, userId);

    if (!note) {
      throw new NotFoundException('Nota não encontrada');
    }

    return note;
  }

  async update(id: string, userId: string, input: UpdateNoteInput) {
    const note = await this.notesRepository.update(id, userId, input);

    if (!note) {
      throw new NotFoundException('Nota não encontrada');
    }

    return note;
  }

  async remove(id: string, userId: string) {
    const removed = await this.notesRepository.remove(id, userId);

    if (!removed) {
      throw new NotFoundException('Nota não encontrada');
    }
  }
}
