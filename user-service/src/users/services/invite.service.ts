import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { DeleteInviteDto } from '../dto/delete-invite.dto';

@Injectable()
export class InviteService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async invite(dto: CreateInviteDto) {
    const organization = await this.organizationRepository.getOrganization();
    organization.createInvite(dto.email, dto.role);
    await this.organizationRepository.save(organization);
  }

  async deleteInvite(dto: DeleteInviteDto) {
    const organization = await this.organizationRepository.getOrganization();
    organization.deleteInvite(dto.id);
    await this.organizationRepository.save(organization);
  }
}
