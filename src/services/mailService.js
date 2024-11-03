const { Resend } = require('resend'); // Asegúrate de que la importación es correcta
const resend = new Resend(process.env.apikey_resend); // Si Resend es una clase
exports.sendMail = async (req, res) => {
    let { to, subject, text } = req.body;
    // añadir al subject la fecha y hora
    const date = new Date();
    const dateStr = date.toISOString().replace('T', ' ').replace(/\..+/, '');
    subject += ` - ${dateStr}`;
    try {
        const { data, error } = await resend.emails.send({
            from: 'mail@mercattorreblanca.cat',
            to: [to],
            subject: subject,
            text: text,
        });
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ data });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};