import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ErrorResponseModel } from '../common/swagger/response.models';
import { FilesService } from './files.service';
import { fileIdSchema, type FileIdInput } from './schemas/file-id.schema';
import { FileResponseModel } from './swagger/file-response.model';

@ApiTags('Arquivos')
@ApiBearerAuth('bearer')
@Controller('files')
@UseGuards(JwtAuthGuard)
@SkipThrottle({ login: true, register: true })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Enviar um arquivo privado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: FileResponseModel })
  @ApiResponse({ status: 400, type: ErrorResponseModel })
  @ApiResponse({ status: 401, type: ErrorResponseModel })
  @ApiResponse({ status: 413, type: ErrorResponseModel })
  @ApiResponse({ status: 415, type: ErrorResponseModel })
  @ApiResponse({ status: 429, type: ErrorResponseModel })
  upload(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Envie exatamente um arquivo no campo file',
      );
    }

    return this.filesService.upload(request.user.sub, file);
  }

  @Get()
  @ApiOperation({ summary: 'Listar os arquivos do usuário autenticado' })
  @ApiResponse({ status: 200, type: [FileResponseModel] })
  @ApiResponse({ status: 401, type: ErrorResponseModel })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.filesService.findAll(request.user.sub);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Baixar um arquivo próprio' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Arquivo para download.' })
  @ApiResponse({ status: 400, type: ErrorResponseModel })
  @ApiResponse({ status: 401, type: ErrorResponseModel })
  @ApiResponse({ status: 404, type: ErrorResponseModel })
  async download(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(fileIdSchema)) params: FileIdInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.filesService.download(params.id, request.user.sub);

    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      createContentDisposition(file.nomeOriginal),
    );
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'private, no-store');

    return new StreamableFile(file.stream);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar metadados de um arquivo próprio' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: FileResponseModel })
  @ApiResponse({ status: 400, type: ErrorResponseModel })
  @ApiResponse({ status: 401, type: ErrorResponseModel })
  @ApiResponse({ status: 404, type: ErrorResponseModel })
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(fileIdSchema)) params: FileIdInput,
  ) {
    return this.filesService.findOne(params.id, request.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um arquivo próprio' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Arquivo excluído sem corpo.' })
  @ApiResponse({ status: 400, type: ErrorResponseModel })
  @ApiResponse({ status: 401, type: ErrorResponseModel })
  @ApiResponse({ status: 404, type: ErrorResponseModel })
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(fileIdSchema)) params: FileIdInput,
  ): Promise<void> {
    await this.filesService.remove(params.id, request.user.sub);
  }
}

function createContentDisposition(fileName: string): string {
  const fallback =
    fileName
      .normalize('NFKD')
      .replace(/[^\x20-\x7e]/g, '_')
      .replace(/["\\]/g, '_') || 'arquivo';
  const encoded = encodeURIComponent(fileName).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
