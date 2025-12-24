import { Injectable } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class BrevoProviders {
  private emailApi: Brevo.TransactionalEmailsApi;
  constructor(private configService: ConfigService) {
    this.emailApi = new Brevo.TransactionalEmailsApi();
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not defined in environment variables');
    }
    this.emailApi.setApiKey(0, apiKey);
  }

  async sendEmail(to: string, customSubject: string, htmlContent: string) {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: this.configService.get<string>('ADMIN_EMAIL_ADDRESS'),
      name: this.configService.get<string>('ADMIN_EMAIL_NAME'),
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = customSubject;
    sendSmtpEmail.htmlContent = htmlContent;

    return this.emailApi.sendTransacEmail(sendSmtpEmail);
  }
}
