import { Module } from '@nestjs/common';
import { HeroBannerController } from './hero-banner.controller';
import { HeroBannerService } from './hero-banner.service';

@Module({
  controllers: [HeroBannerController],
  providers: [HeroBannerService],
})
export class HeroBannerModule {}
