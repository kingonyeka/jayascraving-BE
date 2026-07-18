import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // global so CacheService can be injected anywhere without importing CacheModule
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class AppCacheModule {}