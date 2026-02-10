"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = require("joi");
exports.envValidationSchema = Joi.object({
    AWS_REGION: Joi.string().required(),
    BEDROCK_MODEL_ID: Joi.string().required(),
    PORT: Joi.number().optional(),
});
//# sourceMappingURL=validation.js.map