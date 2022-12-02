const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");
const AppError = require("./error");
class Email {
  constructor(recipient, subject, text_message) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "notifications.gpaelevator@gmail.com",
        pass: "twvybtnhwsaatxan",
      },
    });
    this.fullName = recipient.name;
    this.from = "admin@gpaelevator.com";
    this.to = recipient.email;
    this.subject = subject;
    this.text = text_message;
  }
  async send(html, subject) {
    //render html based on pug template

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      console.log("error sending email", err);
      new AppError("failed to send email", 403);
    }
  }
  async sendEmail() {
    try {
      this.transporter.sendMail(this.mailOptions);
    } catch (err) {
      console.log("error sending email", err);
      new AppError("failed to send email", 403);
    }
  }
  async sendWelcome() {
    console.log("reached there");
    const html = pug.renderFile(`${__dirname}/../views/email/welcome.pug`, {
      firstName: this.firstName,
      subject: this.subject,
    });
    await this.send(html, "Welcome to Gpa Elevator");
  }

  async sendPasswordReset(url) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/passwordReset.pug`,
      {
        firstName: this.firstName,
        subject: this.subject,
        url,
      }
    );
    await this.send(html, "Reset Password");
  }

  async sendNotification(object, objName) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/notification.pug`,
      {
        object,
        objName,
      }
    );
    await this.send(html, "Notification");
  }
  async sendVerifyAccount(token) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/verifyAccount.pug`,
      {
        fullName: this.fullName,
        subject: this.subject,
        token,
      }
    );
    await this.send(html, "Verify Account");
  }
  async sendAccessCode(token) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/verifyAccess.pug`,
      {
        fullName: this.fullName,
        subject: this.subject,
        token,
      }
    );
    await this.send(html, "Verify Identity");
  }

  async sendFileUploadNotification(
    courseUnit,
    academic_year,
    custom_name,
    category,
    downloadURL
  ) {
    const html = pug.renderFile(`${__dirname}/../views/email/info.pug`, {
      firstName: this.firstName,
      courseUnit: courseUnit.replace(/-/g, " "),
      academic_year: academic_year,
      custom_name: custom_name,
      category: category,
      downloadURL,
    });

    await this.send(html, "New Document Uploaded");
  }

  async sendSurveyNotification(downloadURL) {
    const html = pug.renderFile(`${__dirname}/../views/email/survey.pug`, {
      firstName: this.firstName,
      lastName: this.lastName,
      downloadURL,
    });

    await this.send(html, "GPA ELEVATOR v1.2.0 RELEASE SURVEY");
  }
}

module.exports = Email;
