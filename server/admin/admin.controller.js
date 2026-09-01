const Admin = require("./admin.model");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { deleteFile } = require("../../util/deleteFile");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const nodemailer = require("nodemailer");
const { compressImage } = require("../../util/compressImage");

//create admin
exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!" });

    if (req.file) {
      // compress image
      compressImage(req.file);
    }

    const admin = new Admin();
    admin.name = req.body.name;
    admin.email = req.body.email;
    admin.password = req.body.password;
    admin.image = req.file ? req.file.path : null;

    await admin.save((error, admin) => {
      if (error)
        return res.status(200).json({ status: false, message: error.message });
      else
        return res.status(200).json({
          status: true,
          message: "Success!!",
          admin,
        });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin)
      return res
        .status(200)
        .json({ status: false, message: "Admin doesn't Exist!" });

    admin.name = req.body.name;
    admin.email = req.body.email;

    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Admin Updated Successfully",
      admin,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update admin profile image
exports.updateImage = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Admin does not Exist!" });
    }

    if (req.file) {
      if (fs.existsSync(admin.image)) {
        fs.unlinkSync(admin.image);
      }

      // compress image
      compressImage(req.file);

      admin.image = req.file.path;
    }

    await admin.save();

    return res.status(200).json({ status: true, message: "Success!!", admin });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update admin password
exports.updatePassword = async (req, res) => {
  try {
    if (req.body.oldPass || req.body.newPass || req.body.confirmPass) {
      Admin.findOne({ _id: req.admin._id }).exec(async (err, admin) => {
        if (err)
          return res.status(200).json({ status: false, message: err.message });
        else {
          const validPassword = bcrypt.compareSync(
            req.body.oldPass,
            admin.password
          );

          if (!validPassword)
            return res.status(200).json({
              status: false,
              message: "Oops ! Old Password doesn't match ",
            });

          if (req.body.newPass !== req.body.confirmPass) {
            return res.status(200).json({
              status: false,
              message: "Oops ! New Password and Confirm Password doesn't match",
            });
          }
          const hash = bcrypt.hashSync(req.body.newPass, 10);

          await Admin.updateOne(
            { _id: req.admin._id },
            { $set: { password: hash } }
          ).exec((error, updated) => {
            if (error)
              return res.status(200).json({
                status: false,
                message: error.message,
              });
            else
              return res.status(200).json({
                status: true,
                message: "Password changed Successfully",
              });
          });
        }
      });
    } else
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//admin login
exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details!" });

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "Oops! Email doesn't exist.",
      });
    }
    const isPassword = bcrypt.compareSync(req.body.password, admin.password);
    if (!isPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match.",
      });
    }

    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      flag: admin.flag
    };

    const token = jwt.sign(payload, config.JWT_SECRET);

    return res.status(200).json({ status: true, message: "Success!!", token });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "Admin does not Exist" });
    }
    return res.status(200).json({ status: true, message: "success", admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });

    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "Email does not Exist!" });
    }

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.EMAIL,
        pass: config.PASSWORD,
      },
    });

    var tab = "";
    tab += "<!DOCTYPE html><html><head>";
    tab +=
      "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab +=
      " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab +=
      "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab +=
      "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab +=
      "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab +=
      "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab +=
      "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://www.stampready.net/dashboard/editor/user_uploads/zip_uploads/2018/11/23/5aXQYeDOR6ydb2JtSG0p3uvz/zip-for-upload/images/template1-icon.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab +=
      "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab +=
      "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      config.SERVER_PATH +
      "changePassword/" +
      admin._id +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab +=
      "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    var mailOptions = {
      from: config.EMAIL,
      to: req.body.email,
      subject: "Sending Email from Reyzi",
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).json({
          status: true,
          message: "Email send successfully",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.setPassword = async (req, res, next) => {
  try {
    if (req.body.newPass || req.body.confirmPass) {
      Admin.findOne({ _id: req.params.adminId }).exec(async (err, admin) => {
        if (err)
          return res.status(200).json({ status: false, message: err.message });
        else {
          if (req.body.newPass !== req.body.confirmPass) {
            return res.status(200).json({
              status: false,
              message: "Oops ! New Password and Confirm Password doesn't match",
            });
          }
          bcrypt.hash(req.body.newPass, 10, (err, hash) => {
            if (err)
              return res.status(200).json({
                status: false,
                message: err.message,
              });
            else {
              Admin.update(
                { _id: req.params.adminId },
                { $set: { password: hash } }
              ).exec((error, updated) => {
                if (error)
                  return res.status(200).json({
                    status: false,
                    message: error.message,
                  });
                else
                  res.status(200).json({
                    status: true,
                    message: "Password Reset Successfully",
                  });
              });
            }
          });
        }
      });
    } else
      return res
        .status(200)
        .send({ status: false, message: "Invalid details!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
