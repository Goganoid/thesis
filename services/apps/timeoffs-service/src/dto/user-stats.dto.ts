export class StatsDto {
  total: number;
  used: number;
}

export class UserStatsDto {
  sickDays: StatsDto;
  timeoffDays: StatsDto;
}
