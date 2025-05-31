"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logout = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const userModel_1 = require("../../models/userModel");
const error_1 = require("../../middleware/error");
const setCookies_1 = __importDefault(require("../../utils/setCookies"));
const crypto_1 = __importDefault(require("crypto"));
// import { db } from "../../db/db";
const sendMail_1 = require("../../utils/sendMail");
const hashPassword = (password, salt) => {
    return new Promise((resolve, reject) => {
        crypto_1.default.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
            if (err)
                reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
};
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield userModel_1.Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create new user
        const salt = crypto_1.default.randomBytes(16).toString('hex');
        const hashedPassword = yield hashPassword(password, salt);
        const newUser = new userModel_1.Admin({
            firstname,
            email,
            salt,
            password: hashedPassword,
        });
        yield newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = yield userModel_1.Admin.findOne({ email }).select('+password +salt');
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Compare password
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        (0, setCookies_1.default)({
            user,
            res,
            next,
            message: "Login Success",
            statusCode: 200,
        });
        res.status(200).json({ message: 'Logged in successfully' });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
});
exports.login = login;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userModel_1.Admin.findOne({ email });
        if (!user)
            return next(new error_1.CustomError("Email not registered", 400));
        const resetToken = yield user.getToken();
        yield user.save(); //saving the token in user
        const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        // await otpQueue.add("otpVerify", {
        //   options: {
        //     email: email,
        //     subject: "Password Reset",
        //     message: `You reset password link is here ${url}`,
        //   },
        // });
        yield (0, sendMail_1.sendMail)({
            email,
            subject: "Password Reset",
            message: url,
            tag: 'password_reset'
        });
        (0, setCookies_1.default)({
            user,
            res,
            next,
            message: "Login Success",
            statusCode: 200,
        });
        res.status(200).json({
            success: true,
            message: `Reset password link sent to ${email}`,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { password } = req.body;
    try {
        if (!token) {
            throw new Error("Reset token is required");
        }
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        console.log('Reset Password Token:', resetPasswordToken);
        const user = yield userModel_1.Admin.findOne({
            resetPasswordToken,
            resetTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
        const hashedPassword = yield new Promise((resolve, reject) => {
            crypto_1.default.pbkdf2(password, user.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    reject(err);
                resolve(derivedKey.toString('hex'));
            });
        });
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetTokenExpiry = null;
        yield user.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
});
exports.resetPassword = resetPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .status(200)
        .cookie("token", null, {
        expires: new Date(Date.now()),
    })
        .json({
        success: true,
        message: "Logged out",
    });
});
exports.logout = logout;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.Admin.findById(req.user._id);
        if (!user)
            return next(new error_1.CustomError("User not found", 400));
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
});
exports.getUser = getUser;
