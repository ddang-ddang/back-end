import { PartialType } from '@nestjs/mapped-types';
import { CreateAchievementsDto } from './create-achievements.dto';

export class UpdateAchievementsDto extends PartialType(CreateAchievementsDto) {}
