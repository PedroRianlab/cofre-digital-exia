import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { NotesService } from './notes.service';
import {
  createNoteSchema,
  type CreateNoteInput,
} from './schemas/create-note.schema';
import { noteIdSchema, type NoteIdInput } from './schemas/note-id.schema';
import {
  updateNoteSchema,
  type UpdateNoteInput,
} from './schemas/update-note.schema';

@Controller('notes')
@UseGuards(JwtAuthGuard)
@SkipThrottle({ login: true, register: true })
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createNoteSchema)) input: CreateNoteInput,
  ) {
    return this.notesService.create(request.user.sub, input);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.notesService.findAll(request.user.sub);
  }

  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(noteIdSchema)) params: NoteIdInput,
  ) {
    return this.notesService.findOne(params.id, request.user.sub);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(noteIdSchema)) params: NoteIdInput,
    @Body(new ZodValidationPipe(updateNoteSchema)) input: UpdateNoteInput,
  ) {
    return this.notesService.update(params.id, request.user.sub, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(noteIdSchema)) params: NoteIdInput,
  ): Promise<void> {
    await this.notesService.remove(params.id, request.user.sub);
  }
}
