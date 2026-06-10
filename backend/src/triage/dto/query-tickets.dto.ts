import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const CATEGORIES = [
  'technical_support', 'billing', 'feature_request',
  'bug_report', 'general_inquiry', 'account_issue', 'complaint',
] as const;

const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

export class QueryTicketsDto {
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
