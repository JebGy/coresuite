import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SolicitudEmailData {
  solicitudId: number;
  asunto: string;
  solicitante: {
    nombres: string;
    apellidos: string;
    email: string;
  };
  elementos: { nombre: string; cantidad: number }[];
  fechaSolicitud: string;
}

interface AprobacionEmailData {
  solicitudId: number;
  asunto: string;
  estado: "APROBADO" | "RECHAZADO";
  motivo?: string;
  solicitante: {
    nombres: string;
    apellidos: string;
    email: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Configuración del transportador de correo
      // Estas variables deben estar en el archivo .env
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      };

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn(
          "Configuración de correo incompleta. Las notificaciones por correo no funcionarán."
        );
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;
    } catch (error) {
      console.error("Error al configurar el servicio de correo:", error);
    }
  }

  async sendSolicitudNotification(data: SolicitudEmailData): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn(
        "Servicio de correo no configurado. No se enviará notificación."
      );
      return false;
    }

    try {
      // Correos de destino (Gerencia Administrativa y Logística)
      // Check if environment variables exist, otherwise use default values
      const adminEmail = process.env.GERENCIA_ADMIN_EMAIL;
      const logisticEmail = process.env.GERENCIA_LOGISTICA_EMAIL;

      if (!adminEmail || !logisticEmail) {
        console.warn(
          "Email recipients not properly configured in environment variables"
        );
      }
      const destinatarios = [
        adminEmail || "gerencia.administrativa@empresa.com",
        logisticEmail || "logistica@empresa.com",
      ];

      const elementosHtml = data.elementos
        .map((el) => `<li>${el.nombre} - Cantidad: ${el.cantidad}</li>`)
        .join("");

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: destinatarios.join(", "),
        cc: data.solicitante.email,
        subject: `Nueva Solicitud de Material/Equipo - ${data.asunto}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nueva Solicitud de Material/Equipo</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalles de la Solicitud</h3>
              <p><strong>ID de Solicitud:</strong> #${data.solicitudId}</p>
              <p><strong>Asunto:</strong> ${data.asunto}</p>
              <p><strong>Solicitante:</strong> ${data.solicitante.nombres} ${data.solicitante.apellidos}</p>
              <p><strong>Email del Solicitante:</strong> ${data.solicitante.email}</p>
              <p><strong>Fecha de Solicitud:</strong> ${data.fechaSolicitud}</p>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Elementos Solicitados</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${elementosHtml}
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Acción Requerida:</strong> Esta solicitud requiere su evaluación y aprobación.
                Por favor, revise los detalles y proceda con la aprobación o rechazo correspondiente.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Este es un correo automático del Sistema de Gestión CoreSuite.
                <br>Por favor, no responda a este correo.
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(
        `Notificación de solicitud enviada para solicitud #${data.solicitudId}`
      );
      return true;
    } catch (error) {
      console.error("Error al enviar notificación de solicitud:", error);
      return false;
    }
  }

  async sendAprobacionNotification(
    data: AprobacionEmailData
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn(
        "Servicio de correo no configurado. No se enviará notificación."
      );
      return false;
    }

    try {
      const estadoTexto = data.estado === "APROBADO" ? "Aprobada" : "Rechazada";
      const estadoColor = data.estado === "APROBADO" ? "#059669" : "#dc2626";
      const estadoBg = data.estado === "APROBADO" ? "#d1fae5" : "#fee2e2";

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: data.solicitante.email,
        cc: [
          process.env.EMAIL_GERENCIA_ADMINISTRATIVA ||
            "gerencia.administrativa@empresa.com",
          process.env.EMAIL_LOGISTICA || "logistica@empresa.com",
        ].join(", "),
        subject: `Solicitud ${estadoTexto} - ${data.asunto}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${estadoColor};">Solicitud ${estadoTexto}</h2>
            
            <div style="background-color: ${estadoBg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${estadoColor};">
              <h3 style="color: ${estadoColor}; margin-top: 0;">Estado: ${estadoTexto}</h3>
              <p><strong>ID de Solicitud:</strong> #${data.solicitudId}</p>
              <p><strong>Asunto:</strong> ${data.asunto}</p>
            </div>
            
            ${
              data.motivo
                ? `
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #dc2626; margin-top: 0;">Motivo del Rechazo</h3>
                <p style="margin-bottom: 0;">${data.motivo}</p>
              </div>
            `
                : ""
            }
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">
                Estimado/a ${data.solicitante.nombres} ${
          data.solicitante.apellidos
        },
                <br><br>
                Su solicitud ha sido ${data.estado.toLowerCase()} por el equipo de gestión.
                ${
                  data.estado === "APROBADO"
                    ? "Puede proceder con las acciones correspondientes según los procedimientos establecidos."
                    : "Si tiene alguna consulta sobre el motivo del rechazo, puede contactar al área correspondiente."
                }
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Este es un correo automático del Sistema de Gestión CoreSuite.
                <br>Por favor, no responda a este correo.
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(
        `Notificación de ${data.estado.toLowerCase()} enviada para solicitud #${
          data.solicitudId
        }`
      );
      return true;
    } catch (error) {
      console.error("Error al enviar notificación de aprobación:", error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Error al verificar conexión de correo:", error);
      return false;
    }
  }
}

// Instancia singleton del servicio de correo
export const emailService = new EmailService();

// Funciones de utilidad para usar en las APIs
export async function notificarNuevaSolicitud(
  data: SolicitudEmailData
): Promise<boolean> {
  return await emailService.sendSolicitudNotification(data);
}

export async function notificarAprobacionSolicitud(
  data: AprobacionEmailData
): Promise<boolean> {
  return await emailService.sendAprobacionNotification(data);
}
