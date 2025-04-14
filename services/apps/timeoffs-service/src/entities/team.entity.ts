import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LeaveRequestEntity } from './leave-request.entity';

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

  @OneToMany(() => LeaveRequestEntity, (leaveRequest) => leaveRequest.team)
  leaveRequests: LeaveRequestEntity[];
}
