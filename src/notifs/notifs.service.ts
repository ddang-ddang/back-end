import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notif } from './entities/notif.entity';
import { Region } from '../quests/entities/region.entity';

@Injectable()
export class NotifsService {
  constructor(
    @InjectRepository(Notif)
    private readonly notifs: Repository<Notif>,
    @InjectRepository(Region)
    private readonly regions: Repository<Region>
  ) {}

  private readonly logger = new Logger(NotifsService.name);

  /* 현재 위치 주변의 알림 전체 조회 */
  async getAll(currentRegion) {
    this.logger.verbose(`${currentRegion.regionDong} 주변의 알림 조회 요청`);
    try {
      const { regionSi, regionGu, regionDong } = currentRegion;
      const regions = await this.regions.find({
        where: { regionSi, regionGu, regionDong },
      });
      if (regions.length === 0)
        return { ok: false, message: '요청하신 지역을 찾을 수 없습니다.' };

      console.log(regions);
      const [...notifs] = await Promise.all([
        ...regions.map(async (region) => {
          await this.notifs.find(region);
        }),
      ]);
      console.log(`알림 응답 값: ${notifs}`);
      if (notifs.length === 0)
        return { ok: false, message: '현재 주변에 알림이 없습니다.' };

      return { ok: true, notifs };
    } catch (error) {
      return { ok: false, message: '주변의 알림을 찾을 수 없습니다.' };
    }
  }
}
