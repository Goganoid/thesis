import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../services/s3.service';

interface PresignedUrlResult {
  presignedUrl: string;
  key: string;
}

export class GeneratePresignedUrlCommand extends Command<PresignedUrlResult> {
  constructor(
    public readonly fileType: string,
    public readonly hash: string,
  ) {
    super();
  }
}

@CommandHandler(GeneratePresignedUrlCommand)
export class GeneratePresignedUrlHandler
  implements ICommandHandler<GeneratePresignedUrlCommand>
{
  constructor(private readonly s3Service: S3Service) {}

  async execute({
    fileType,
    hash,
  }: GeneratePresignedUrlCommand): Promise<PresignedUrlResult> {
    return await this.s3Service.generatePresignedPutUrl(fileType, hash);
  }
}
