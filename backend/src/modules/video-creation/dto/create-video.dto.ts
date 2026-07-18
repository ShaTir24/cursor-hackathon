import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'username must contain only letters, numbers, underscores, or hyphens',
  })
  username!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  prompt!: string;
}
