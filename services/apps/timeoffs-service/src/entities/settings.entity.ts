import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class SettingsEntity {
  @PrimaryColumn({ type: 'varchar', default: 'primary', nullable: false })
  id: string;

  @Column({ type: 'int', nullable: false })
  maxVacationDays: number;

  @Column({ type: 'int', nullable: false })
  maxSickDays: number;
}
