// Envío de correo (nodemailer). Lee SMTP de variables de entorno.
// Si no hay SMTP configurado, opera en "modo stub" (registra, no envía).
const nodemailer = require('nodemailer')

function getTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // true para 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

async function enviarCorreo({ to, subject, html, text }) {
  const transport = getTransport()
  if (!transport) {
    console.log(`[email · stub] Para: ${to} · Asunto: ${subject}`)
    return { enviado: false, modo: 'stub' }
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })
  return { enviado: true, modo: 'smtp' }
}

// Plantilla HTML de marca para el resumen al cliente.
function plantillaResumen({ radicado, contenido }) {
  return `<!doctype html><html><body style="margin:0;background:#0D0D0D;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;color:#fff;">
    <div style="background:#141414;border:1px solid #2A2A2A;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 4px;color:#fff;">Actualización de su proceso</h2>
      <p style="margin:0 0 16px;color:#84120C;font-weight:bold;font-family:monospace;">Radicado ${radicado}</p>
      <p style="margin:0 0 8px;color:#fff;font-weight:bold;">Resumen IA</p>
      <p style="margin:0;color:#D9D9D9;line-height:1.6;">${(contenido || '').replace(/\n/g, '<br>')}</p>
    </div>
    <p style="margin:16px 0 0;color:#777;font-size:12px;text-align:center;">
      Hurtado Gandini · Powered by MagicJuris
    </p>
  </div></body></html>`
}

module.exports = { enviarCorreo, plantillaResumen }
