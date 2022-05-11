import { EntityRepository, Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';

@EntityRepository(Region)
export class RegionsRepository extends Repository<Region> {
  /* 동 생성 */
  createAndSave = async ({
    regionSi,
    regionGu,
    regionDong,
  }: CreateRegionDto) => {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      ('0' + (today.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + today.getDate()).slice(-2);
    return await this.save({
      date,
      regionSi,
      regionGu,
      regionDong,
    });
  };

  /* 전체 동 조회 */
  findByAddrs = async ({ regionSi, regionGu, regionDong }): Promise<Region> => {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      ('0' + (today.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + today.getDate()).slice(-2);
    return await this.findOne({
      where: { date, regionSi, regionGu, regionDong },
    });
  };
}
