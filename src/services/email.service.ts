// ============================================
// Email Service - Professional Email Sending
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
const FROM_EMAIL = 'ouyaboung <noreply@oyaboug.com>'; // Change to your verified domain

/**
 * Send merchant approval email
 */
export const sendMerchantApprovalEmail = async (
    email: string,
    businessName: string
): Promise<{ success: boolean; error?: string }> => {
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured. Email not sent.');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: email,
                subject: `${businessName} - Votre commerce a été approuvé! 🎉`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                🎉 Félicitations!
              </h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Bonjour,
              </p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Excellente nouvelle! Votre commerce <strong style="color: #16a34a;">${businessName}</strong> a été approuvé par notre équipe.
              </p>

              <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 30px 0; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #166534;">
                  ✅ Vous pouvez maintenant créer votre compte marchand et commencer à publier vos invendus sur la plateforme ouyaboung.
                </p>
              </div>

              <p style="font-size: 16px; margin-bottom: 30px;">
                Pour finaliser votre inscription, créez votre compte en cliquant sur le bouton ci-dessous:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${APP_URL}/auth?role=merchant&email=${encodeURIComponent(email)}" 
                   style="display: inline-block; background: #16a34a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2);">
                  Créer mon compte marchand
                </a>
              </div>

              <div style="background: #fef9c3; border: 1px solid #fde047; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #854d0e;">
                  ⚠️ <strong>Important:</strong> Utilisez l'adresse email <strong>${email}</strong> lors de la création de votre compte.
                </p>
              </div>

              <h3 style="color: #16a34a; font-size: 18px; margin-top: 40px; margin-bottom: 16px;">
                Prochaines étapes:
              </h3>

              <ol style="font-size: 15px; color: #4b5563; padding-left: 20px;">
                <li style="margin-bottom: 12px;">Créez votre compte marchand avec l'email ${email}</li>
                <li style="margin-bottom: 12px;">Complétez votre profil et ajoutez vos horaires d'ouverture</li>
                <li style="margin-bottom: 12px;">Publiez vos premiers invendus sur la plateforme</li>
                <li style="margin-bottom: 12px;">Commencez à sauver de la nourriture et augmenter vos revenus!</li>
              </ol>

              <p style="font-size: 16px; margin-top: 40px; margin-bottom: 0;">
                Bienvenue dans la communauté ouyaboung! 🌱
              </p>

              <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                L'équipe ouyaboung
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} ouyaboung. Tous droits réservés.
              </p>
              <p style="margin: 10px 0 0 0;">
                Ensemble, luttons contre le gaspillage alimentaire au Gabon.
              </p>
            </div>

          </body>
          </html>
        `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Resend API error:', errorData);
            return { success: false, error: errorData.message || 'Email send failed' };
        }

        const data = await response.json();
        console.log('Merchant approval email sent:', data);
        return { success: true };

    } catch (error: any) {
        console.error('Error sending merchant approval email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send merchant rejection email
 */
export const sendMerchantRejectionEmail = async (
    email: string,
    businessName: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> => {
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured. Email not sent.');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: email,
                subject: `${businessName} - Mise à jour de votre demande`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: #dc2626; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
                Mise à jour de votre demande
              </h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Bonjour,
              </p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Nous avons examiné votre demande d'inscription pour <strong>${businessName}</strong>.
              </p>

              <p style="font-size: 16px; margin-bottom: 30px;">
                Malheureusement, nous ne pouvons pas approuver votre demande pour le moment${reason ? ' pour la raison suivante:' : '.'}
              </p>

              ${reason ? `
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 30px 0; border-radius: 6px;">
                  <p style="margin: 0; font-size: 14px; color: #991b1b;">
                    ${reason}
                  </p>
                </div>
              ` : ''}

              <p style="font-size: 16px; margin-top: 30px;">
                N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez soumettre une nouvelle demande avec plus d'informations.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="mailto:contact@oyaboug.com" 
                   style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Nous contacter
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">
                Cordialement,<br>
                L'équipe ouyaboung
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} ouyaboung. Tous droits réservés.
              </p>
            </div>

          </body>
          </html>
        `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Resend API error:', errorData);
            return { success: false, error: errorData.message || 'Email send failed' };
        }

        const data = await response.json();
        console.log('Merchant rejection email sent:', data);
        return { success: true };

    } catch (error: any) {
        console.error('Error sending merchant rejection email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fallback: Log email to console if Resend is not configured
 */
export const logEmailToConsole = (
    type: 'approval' | 'rejection',
    email: string,
    businessName: string,
    reason?: string
) => {
    console.log('\n========== EMAIL SIMULATION ==========');
    console.log(`Type: ${type === 'approval' ? 'APPROVAL' : 'REJECTION'}`);
    console.log(`To: ${email}`);
    console.log(`Business: ${businessName}`);
    if (reason) console.log(`Reason: ${reason}`);
    console.log(`Action URL: ${APP_URL}/auth?role=merchant&email=${encodeURIComponent(email)}`);
    console.log('======================================\n');
};
