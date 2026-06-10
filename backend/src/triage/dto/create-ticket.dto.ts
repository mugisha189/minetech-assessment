import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;
}
