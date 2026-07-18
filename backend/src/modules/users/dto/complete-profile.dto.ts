import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CompleteProfileDto {
  @IsIn(['student', 'tutor'])
  persona!: 'student' | 'tutor';

  @ValidateIf((o: CompleteProfileDto) => o.persona === 'student')
  @IsString()
  ageGroupId?: string;

  @ValidateIf((o: CompleteProfileDto) => o.persona === 'tutor')
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  teachingAgeGroupIds?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  topicIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  themeIds!: string[];

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  displayName?: string;
}
