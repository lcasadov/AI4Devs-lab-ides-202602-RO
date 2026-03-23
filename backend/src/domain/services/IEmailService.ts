export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailService {
  send(dto: SendEmailDto): Promise<void>;
}
