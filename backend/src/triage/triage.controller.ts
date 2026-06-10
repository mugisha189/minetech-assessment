import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { TriageService } from './triage.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';

@Controller()
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post('triage')
  async processTicket(@Body() dto: CreateTicketDto) {
    return this.triageService.processTicket(dto.text);
  }

  @Get('tickets')
  async listTickets(@Query() query: QueryTicketsDto) {
    return this.triageService.listTickets({
      category: query.category,
      priority: query.priority,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string) {
    return this.triageService.getTicket(id);
  }
}
