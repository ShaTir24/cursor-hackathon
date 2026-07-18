import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/jwt-auth.guard';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { ok: true };
  }
}
