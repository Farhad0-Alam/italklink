import fs from 'fs/promises'; // Use promises API for modern async/await handling
import Common from '../../../helpers/Common';
import CommonAPI from '../../../helpers/CommonAPI';
import dbConnect from '../../../lib/dbConnect';
import { AdminSettings } from '../../../models/DB';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'POST') {
        const postdata = req.body;

        try {
            // Validate and process the contact form data
            const { fullName, email, phone, message, userEmail } = postdata;
            let uEmail = email.toLowerCase().trim();

            // Ensure the contact form data is valid
            if (!fullName || !email || !phone || !message) {
                return res.status(400).json({
                    status: 'error',
                    message: 'All fields are required',
                });
            }

            // Read the email template
            const htmlToSend = await fs.readFile('./email_template/contactUs.txt', 'utf8');

            // Replace placeholders with actual data
            let object = {
                "{full_name}": fullName,
                "{email}": email,
                "{phone}": phone,
                "{message}": message,
            };
            let replaces = Common.replaceItemByObj(htmlToSend, object);

            // Set up email parameters
            let params = {
                to: userEmail, // Replace with your contact email address
                subject: 'New Contact Us Submission',
                html: replaces,
            };
            // Retrieve email settings from the database
            let emailData = await AdminSettings.findOne();
            let settings = emailData.emailSettings;

            // Send email based on the email provider
            let mailResponse;
            if (settings.name === 'Mandrill') {
                mailResponse = await CommonAPI.sendMailUsingMandrill(params, settings);
            } else if (settings.name === 'SMTP') {
                mailResponse = await CommonAPI.sendMailUsingSMTP(params, settings);
            } else if (settings.name === 'Sendgrid') {
                mailResponse = await CommonAPI.sendMailUsingSendgrid(params, settings);
            } else {
                return res.status(500).json({
                    status: 'error',
                    message: 'Unsupported email provider',
                });
            }

            // Check the response and send appropriate feedback
            if (mailResponse.accepted.length > 0) {
                res.json({
                    status: 'success',
                    message: 'Message sent successfully.',
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to send message.',
                    data: mailResponse.rejected[0]?.reject_reason || 'Unknown error',
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({
                status: 'error',
                message: 'Server error',
            });
        }
    } else {
        // Method not allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
