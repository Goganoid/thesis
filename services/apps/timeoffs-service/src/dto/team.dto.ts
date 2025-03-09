export class MemberDto {
  id: string;
  name: string;
}

export class TeamDto {
  id: string;
  name: string;
  representativeId: string | null;
  members: MemberDto[];
}
