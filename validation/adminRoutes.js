const Joi = require('joi');

const adminRouteSchema = Joi.object({
  id: Joi.string().length(24).alphanum().required(),
  reason: Joi.string().alphanum().required(),
});

module.exports = { adminRouteSchema };
