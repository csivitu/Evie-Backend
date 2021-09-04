const Joi = require('joi');

const eventFormSchema = Joi.object({
  title: Joi.string().min(3).max(70).required(),
  cname: Joi.string().min(3).max(70).required(),
  email: Joi.string().email().lowercase().required(),
  desc: Joi.string().max(300).required(),
  start: Joi.date(),
  end: Joi.date().min(Joi.ref('start')),
  img: Joi.string().pattern(new RegExp('https?://(www.)?([-a-zA-Z0-9@:%._+~#=]{1,256}.)+[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*).(jpg|gif|png|jpeg)$')).required(),
  url: Joi.string().pattern(new RegExp('https?://(www.)?([-a-zA-Z0-9@:%._+~#=]{1,256}.)+[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)')).required(),
  org: Joi.string().min(3).max(50).required(),
  backgroundColor: Joi.string().pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')).required(),
  textColor: Joi.string().pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')).required(),
});

module.exports = { eventFormSchema };
