import {
  Controller, Post, Get, Delete, Body, Param,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { KnowledgeService } from './knowledge.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { extractText, isSupportedFile, supportedExtensionsList } from './file-parser';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  async addDocument(@Body() dto: CreateDocumentDto) {
    return this.knowledgeService.addDocument(dto.title, dto.content, dto.source);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('source') source?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    if (!isSupportedFile(file.originalname)) {
      throw new BadRequestException(
        `Unsupported file type. Accepted: ${supportedExtensionsList()}`,
      );
    }

    const content = await extractText(file.buffer, file.originalname);
    if (!content.trim()) throw new BadRequestException('File appears to be empty.');

    const docTitle = (title?.trim()) || file.originalname.replace(/\.[^.]+$/, '');
    return this.knowledgeService.addDocument(docTitle, content, source?.trim() || undefined);
  }

  @Get()
  async listDocuments() {
    return this.knowledgeService.listDocuments();
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    await this.knowledgeService.deleteDocument(id);
    return { success: true };
  }
}
