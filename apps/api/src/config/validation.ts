import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  AWS_REGION: Joi.string().required(),
  BEDROCK_MODEL_ID: Joi.string().required(),
  PORT: Joi.number().optional(),
});
