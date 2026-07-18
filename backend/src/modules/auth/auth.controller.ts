import { Controller, Post } from '@nestjs/common';
import { CurrentUser, type AuthUser } from './jwt-auth.guard';
import { ProfileStore } from '../profiles/profile.store';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly profiles: ProfileStore) {}

  @Post('bootstrap')
  bootstrap(@CurrentUser() user: AuthUser) {
    const profile = this.profiles.bootstrap(user.userId);
    return { profile };
  }
}
