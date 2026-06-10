import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { ChatDto } from './dto/chat.dto';

@Controller()
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('sessions')
  createSession() {
    const sessionId = this.assistantService.createSession();
    return { sessionId };
  }

  @Post('chat')
  async chat(@Body() dto: ChatDto): Promise<any> {
    return this.assistantService.chat(dto.message, dto.sessionId);
  }

  @Get('chat/:sessionId')
  getHistory(@Param('sessionId') sessionId: string): any[] {
    return this.assistantService.getHistory(sessionId);
  }
}
