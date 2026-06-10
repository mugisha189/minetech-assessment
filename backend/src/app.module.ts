import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OllamaModule } from './ollama/ollama.module';
import { TriageModule } from './triage/triage.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AssistantModule } from './assistant/assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OllamaModule,
    TriageModule,
    KnowledgeModule,
    AssistantModule,
  ],
})
export class AppModule {}
