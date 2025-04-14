import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TeamEntity } from './team.entity';

export enum LeaveType {
  TimeOff = 'TimeOff',
  SickLeave = 'SickLeave',
}

export enum LeaveStatus {
  Approved = 'Approved',
  Declined = 'Declined',
  Waiting = 'Waiting',
}

@Entity()
export class LeaveRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  type: LeaveType;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
  })
  status: LeaveStatus;

  @Column({ nullable: true })
  reviewedByRepresentativeId: string;

  @ManyToOne(() => TeamEntity, (team) => team.leaveRequests, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
  team: TeamEntity;

  @Column({ name: 'team_id', type: 'varchar', nullable: false })
  teamId: string;

  @Column({ type: 'timestamptz', nullable: false })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: false })
  endDate: Date;
}
