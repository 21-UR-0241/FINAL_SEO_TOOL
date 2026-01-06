

// // server/services/email-service.ts
// import sgMail from '@sendgrid/mail';

// // Initialize SendGrid with API key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';

// function templatePasswordEmail(code: string) {
//   const html = `
//   <!doctype html>
//   <html>
//   <head>
//     <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <title>Password Reset Code</title>
//     <style>
//       body { margin:0; padding:0; background:#f6f7f9; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
//       .container { max-width:560px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; }
//       .header { padding:20px 24px; font-size:18px; font-weight:700; color:#111827; border-bottom:1px solid #edf2f7;}
//       .content { padding:24px; font-size:14px; line-height:1.6; color:#111827; }
//       .code { background:#f3f4f6; border-radius:12px; padding:18px; text-align:center; font-size:28px; font-weight:700; letter-spacing:6px; margin: 20px 0; }
//       .muted { color:#6b7280; font-size:12px; margin-top:12px; }
//       .footer { padding:16px 24px; color:#6b7280; font-size:12px; text-align:center; }
//     </style>
//   </head>
//   <body>
//     <div style="padding:24px;">
//       <div class="container">
//         <div class="header">AI Content Manager</div>
//         <div class="content">
//           <p>Hello,</p>
//           <p>Here is your password reset verification code:</p>
//           <div class="code">${code}</div>
//           <p class="muted">This code expires in <b>10 minutes</b>. If you didn't request this, you can safely ignore this email.</p>
//         </div>
//         <div class="footer">
//           This is an automated message. Please do not reply to this email.
//         </div>
//       </div>
//     </div>
//   </body>
//   </html>`;
//   return html;
// }

// function templateVerificationEmail(code: string) {
//   const html = `
//   <!doctype html>
//   <html>
//   <head>
//     <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <title>Email Verification Code</title>
//     <style>
//       body { margin:0; padding:0; background:#f6f7f9; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
//       .container { max-width:560px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; }
//       .header { padding:20px 24px; font-size:18px; font-weight:700; color:#111827; border-bottom:1px solid #edf2f7;}
//       .content { padding:24px; font-size:14px; line-height:1.6; color:#111827; }
//       .code { background:#f3f4f6; border-radius:12px; padding:18px; text-align:center; font-size:28px; font-weight:700; letter-spacing:6px; margin: 20px 0; }
//       .muted { color:#6b7280; font-size:12px; margin-top:12px; }
//       .footer { padding:16px 24px; color:#6b7280; font-size:12px; text-align:center; }
//     </style>
//   </head>
//   <body>
//     <div style="padding:24px;">
//       <div class="container">
//         <div class="header">Welcome to AI Content Manager</div>
//         <div class="content">
//           <p>Hello,</p>
//           <p>Please verify your email address by entering this code:</p>
//           <div class="code">${code}</div>
//           <p class="muted">This code expires in <b>10 minutes</b>. If you didn't create an account, you can safely ignore this email.</p>
//         </div>
//         <div class="footer">
//           This is an automated message. Please do not reply to this email.
//         </div>
//       </div>
//     </div>
//   </body>
//   </html>`;
//   return html;
// }

// export const emailService = {
//   async sendPasswordResetCode(toEmail: string, code: string) {
//     try {
//       console.log('📧 Sending password reset email via SendGrid to:', toEmail);
      
//       const html = templatePasswordEmail(code);
      
//       await sgMail.send({
//         to: toEmail,
//         from: FROM_EMAIL,
//         subject: 'Password Reset Code',
//         html: html,
//       });

//       console.log('✅ Password reset email sent successfully via SendGrid');
//       return true;
//     } catch (error: any) {
//       console.error('❌ SendGrid error:', error.response?.body || error.message || error);
//       return false;
//     }
//   },

//   async sendVerificationCode(toEmail: string, code: string) {
//     try {
//       console.log('📧 Sending verification email via SendGrid to:', toEmail);
      
//       const html = templateVerificationEmail(code);
      
//       await sgMail.send({
//         to: toEmail,
//         from: FROM_EMAIL,
//         subject: 'Email Verification Code',
//         html: html,
//       });

//       console.log('✅ Verification email sent successfully via SendGrid');
//       return true;
//     } catch (error: any) {
//       console.error('❌ SendGrid error:', error.response?.body || error.message || error);
//       return false;
//     }
//   }
// };

// export default emailService;




// server/services/email-service.ts
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// ✅ UPDATED: Add sender name and email
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const FROM_NAME = process.env.FROM_NAME || 'WordPress AI Manager';

function templatePasswordEmail(code: string) {
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset Code</title>
    <style>
      body { margin:0; padding:0; background:#f6f7f9; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
      .container { max-width:560px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; }
      .header { padding:20px 24px; font-size:18px; font-weight:700; color:#111827; border-bottom:1px solid #edf2f7;}
      .content { padding:24px; font-size:14px; line-height:1.6; color:#111827; }
      .code { background:#f3f4f6; border-radius:12px; padding:18px; text-align:center; font-size:28px; font-weight:700; letter-spacing:6px; margin: 20px 0; }
      .muted { color:#6b7280; font-size:12px; margin-top:12px; }
      .footer { padding:16px 24px; color:#6b7280; font-size:12px; text-align:center; }
    </style>
  </head>
  <body>
    <div style="padding:24px;">
      <div class="container">
        <div class="header">WordPress AI Manager</div>
        <div class="content">
          <p>Hello,</p>
          <p>Here is your password reset verification code:</p>
          <div class="code">${code}</div>
          <p class="muted">This code expires in <b>10 minutes</b>. If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          This is an automated message. Please do not reply to this email.
        </div>
      </div>
    </div>
  </body>
  </html>`;
  return html;
}

function templateVerificationEmail(code: string) {
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Verification Code</title>
    <style>
      body { margin:0; padding:0; background:#f6f7f9; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
      .container { max-width:560px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; }
      .header { padding:20px 24px; font-size:18px; font-weight:700; color:#111827; border-bottom:1px solid #edf2f7;}
      .content { padding:24px; font-size:14px; line-height:1.6; color:#111827; }
      .code { background:#f3f4f6; border-radius:12px; padding:18px; text-align:center; font-size:28px; font-weight:700; letter-spacing:6px; margin: 20px 0; }
      .muted { color:#6b7280; font-size:12px; margin-top:12px; }
      .footer { padding:16px 24px; color:#6b7280; font-size:12px; text-align:center; }
    </style>
  </head>
  <body>
    <div style="padding:24px;">
      <div class="container">
        <div class="header">Welcome to WordPress AI Manager</div>
        <div class="content">
          <p>Hello,</p>
          <p>Please verify your email address by entering this code:</p>
          <div class="code">${code}</div>
          <p class="muted">This code expires in <b>10 minutes</b>. If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          This is an automated message. Please do not reply to this email.
        </div>
      </div>
    </div>
  </body>
  </html>`;
  return html;
}

export const emailService = {
  async sendPasswordResetCode(toEmail: string, code: string) {
    try {
      console.log('📧 Sending password reset email via SendGrid to:', toEmail);
      console.log('📤 From:', FROM_NAME, '<' + FROM_EMAIL + '>');
      
      const html = templatePasswordEmail(code);
      
      // ✅ UPDATED: Use object format with name and email
      await sgMail.send({
        to: toEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: 'Password Reset Code - WordPress AI Manager',
        html: html,
      });

      console.log('✅ Password reset email sent successfully via SendGrid');
      return true;
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error.message || error);
      return false;
    }
  },

  async sendVerificationCode(toEmail: string, code: string) {
    try {
      console.log('📧 Sending verification email via SendGrid to:', toEmail);
      console.log('📤 From:', FROM_NAME, '<' + FROM_EMAIL + '>');
      
      const html = templateVerificationEmail(code);
      
      // ✅ UPDATED: Use object format with name and email
      await sgMail.send({
        to: toEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: 'Verify Your Email - WordPress AI Manager',
        html: html,
      });

      console.log('✅ Verification email sent successfully via SendGrid');
      return true;
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error.message || error);
      return false;
    }
  }
};

export default emailService;