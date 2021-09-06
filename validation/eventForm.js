const Joi = require('joi');

const eventFormSchema = Joi.object({
  title: Joi.string().min(3).max(70).required(),
  cname: Joi.string().min(3).max(70).required(),
  email: Joi.string().email().lowercase().required(),
  desc: Joi.string().max(500).required(),
  start: Joi.date(),
  end: Joi.date().min(Joi.ref('start')),
  img: Joi.string().required(),
  url: Joi.string().required(),
  org: Joi.string().min(3).max(50).required(),
  backgroundColor: Joi.string().pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')).required(),
  textColor: Joi.string().pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')).required(),
});

module.exports = { eventFormSchema };
