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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ErrorResponseModel,
  NoteResponseModel,
} from '../common/swagger/response.models';
import { NotesService } from './notes.service';
import {
  createNoteSchema,
  type CreateNoteInput,
} from './schemas/create-note.schema';
import { noteIdSchema, type NoteIdInput } from './schemas/note-id.schema';
import {
  listNotesQuerySchema,
  type ListNotesQuery,
} from './schemas/list-notes-query.schema';
import {
  updateNoteSchema,
  type UpdateNoteInput,
} from './schemas/update-note.schema';
import {
  CreateNoteRequestModel,
  UpdateNoteRequestModel,
} from './swagger/note-request.models';

@ApiTags('Notas')
@ApiBearerAuth('bearer')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@SkipThrottle({ login: true, register: true })
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nota privada' })
  @ApiBody({ type: CreateNoteRequestModel })
  @ApiResponse({
    status: 201,
    description: 'Nota criada.',
    type: NoteResponseModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
    type: ErrorResponseModel,
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createNoteSchema)) input: CreateNoteInput,
  ) {
    return this.notesService.create(request.user.sub, input);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas do usuário autenticado' })
  @ApiQuery({
    name: 'categoria',
    type: String,
    required: false,
    minLength: 1,
    maxLength: 50,
    description:
      'Filtra as próprias notas pela categoria, ignorando maiúsculas e minúsculas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notas do usuário, ordenadas por atualização decrescente.',
    type: [NoteResponseModel],
  })
  @ApiResponse({
    status: 400,
    description: 'Query inválida.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
    type: ErrorResponseModel,
  })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(listNotesQuerySchema)) query: ListNotesQuery,
  ) {
    return this.notesService.findAll(request.user.sub, query.categoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar uma nota própria' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da nota.' })
  @ApiResponse({
    status: 200,
    description: 'Nota encontrada.',
    type: NoteResponseModel,
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Nota inexistente ou pertencente a outro usuário.',
    type: ErrorResponseModel,
  })
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(noteIdSchema)) params: NoteIdInput,
  ) {
    return this.notesService.findOne(params.id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar uma nota própria' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da nota.' })
  @ApiBody({
    type: UpdateNoteRequestModel,
    description: 'Envie ao menos um campo para atualização.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota atualizada.',
    type: NoteResponseModel,
  })
  @ApiResponse({
    status: 400,
    description: 'ID ou payload inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Nota inexistente ou pertencente a outro usuário.',
    type: ErrorResponseModel,
  })
  update(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(noteIdSchema)) params: NoteIdInput,
    @Body(new ZodValidationPipe(updateNoteSchema)) input: UpdateNoteInput,
  ) {
    return this.notesService.update(params.id, request.user.sub, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir uma nota própria' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da nota.' })
  @ApiResponse({ status: 204, description: 'Nota excluída sem corpo.' })
  @ApiResponse({
    status: 400,
    description: 'ID inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
    type: ErrorResponseModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Nota inexistente ou pertencente a outro usuário.',
    type: ErrorResponseModel,
  })
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(noteIdSchema)) params: NoteIdInput,
  ): Promise<void> {
    await this.notesService.remove(params.id, request.user.sub);
  }
}
