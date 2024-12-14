import globalSettings from '@/lib/settings';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

class MailingService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: globalSettings.MAILING.SMTP_HOST,
      port: globalSettings.MAILING.SMTP_PORT,
      secure: false,
      auth: {
        user: globalSettings.MAILING.SMTP_USER,
        pass: globalSettings.MAILING.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: globalSettings.MAILING.SMTP_FROM,
        to,
        subject,
        text,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const subject = 'Solicitud de Restablecimiento de Contraseña';
    const resetLink = `${globalSettings.BASE_URL}/signin/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">

        <h1 style="color: hsl(168, 100%, 19%); margin-bottom: 20px;">Restablece tu contraseña</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
          Si no has solicitado este cambio, puedes ignorar este correo de manera segura.
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
          Si deseas continuar con el restablecimiento, haz clic en el siguiente botón:
        </p>
        <div style="text-align: center;">
          <a href="${resetLink}" 
             style="display: inline-block; 
                    background-color: hsl(168, 100%, 19%); 
                    color: hsl(0, 0%, 100%); 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;
                    margin-bottom: 25px;">
            Restablecer Contraseña
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Por razones de seguridad, este enlace expirará en 24 horas. Si necesitas un nuevo enlace, 
          puedes solicitarlo nuevamente en nuestra página web.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.
        </p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
          © ${new Date().getFullYear()} FindClo. Todos los derechos reservados.
        </div>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }
}

export const mailingService = new MailingService();