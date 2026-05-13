import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { PartsController } from './parts.controller';
import { PartsAggregatorService } from './parts-aggregator.service';
import { AutoPartsPlusService } from './sources/autoparts-plus.service';
import { RepuestosMaxService } from './sources/repuestos-max.service';
import { GlobalPartsService } from './sources/global-parts.service';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [PartsController],
  providers: [
    AutoPartsPlusService,
    RepuestosMaxService,
    GlobalPartsService,
    PartsAggregatorService,
  ],
})
export class PartsModule {}
