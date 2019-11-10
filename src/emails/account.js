const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send( {
        to: email,
        from: 'danielmmy10@gmail.com',
        subject: 'Welcome to the task manager app',
        text: 'Welcome ' + name + ' to the task manager app.'
    })
}

const sendCancellationEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'danielmmy10@gmail.com',
        subject: 'Account cancelled',
        text: `Goodbye ${name}, thanks for using task manager app.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}