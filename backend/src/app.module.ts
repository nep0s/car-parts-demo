import { Module } from '@nestjs/common';
import { PartsModule } from './parts/parts.module';

@Module({
  imports: [PartsModule],
})
export class AppModule {}
