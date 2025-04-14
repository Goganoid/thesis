import { Observable } from 'rxjs';

export interface UserService {
  findMany(request: { ids: string[] }): Observable<{ users: ProtoUser[] }>;
}

export interface ProtoUser {
  id: string;
  email: string;
  role: string;
}
