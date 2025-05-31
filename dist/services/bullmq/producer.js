"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const redisUri = process.env.REDIS_URI;
const connection = new ioredis_1.Redis(redisUri);
// Reuse the ioredis instance
exports.otpQueue = new bullmq_1.Queue("otp-queue", { connection: connection });
