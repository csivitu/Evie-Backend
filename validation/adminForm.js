const Joi = require('joi');

const adminFormSchema = Joi.object({
  uname: Joi.string().min(3).max(25).required(),
  password: Joi.string().min(3).max(30).alphanum()
    .required(),
});

module.exports = { adminFormSchema };
