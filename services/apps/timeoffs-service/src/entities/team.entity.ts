import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  representativeId: string | null;

  @Column({ type: 'jsonb', default: '[]', nullable: false })
  memberIds: string[];

  @Column({ type: 'varchar', nullable: false })
  name: string;
}
