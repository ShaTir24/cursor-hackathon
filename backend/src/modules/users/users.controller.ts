import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UsersService } from './users.service';

@Controller('users/me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.users.getProfile(user.id);
  }

  @Put('profile')
  completeProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: CompleteProfileDto,
  ) {
    return this.users.completeProfile(user.id, dto);
  }

  @Patch('profile/theme')
  updateTheme(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateThemeDto,
  ) {
    return this.users.updateTheme(user.id, dto);
  }
}
