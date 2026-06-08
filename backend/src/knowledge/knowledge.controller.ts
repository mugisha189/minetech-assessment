import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  async addDocument(@Body() dto: CreateDocumentDto) {
    return this.knowledgeService.addDocument(dto.title, dto.content, dto.source);
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
