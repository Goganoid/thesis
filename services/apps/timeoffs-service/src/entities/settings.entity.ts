import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class SettingsEntity {
  @PrimaryColumn({ type: 'varchar', default: 'primary', nullable: false })
  id: 'primary';

  @Column({ type: 'int', nullable: false })
  maxVacationDays: number;

  @Column({ type: 'int', nullable: false })
  maxSickDays: number;
}
