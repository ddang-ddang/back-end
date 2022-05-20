import { EntityRepository, Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';

@EntityRepository(Achievement)
export class AchievementRepository extends Repository<Achievement> {
  
}
