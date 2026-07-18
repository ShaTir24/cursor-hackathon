import { IsIn } from 'class-validator';

export class UpdateThemeDto {
  @IsIn(['lagoon', 'ink'])
  uiTheme!: 'lagoon' | 'ink';
}
