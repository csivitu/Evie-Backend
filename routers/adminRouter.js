const express = require('express');
const jwt = require('jsonwebtoken');
const Mailgun = require('mailgun-js');
const inlineCSS = require('inline-css');

const router = express.Router();
const Events = require('../models/events');
const Approved = require('../models/approved');
const Admin = require('../models/admin');

const approved = require('../templates/email_approved');
const denied = require('../templates/email_denied');
const { logger } = require('../logs/logger');
const { adminFormSchema } = require('../validation/adminForm');
const { adminRouteSchema } = require('../validation/adminRoutes');

const mailgun = new Mailgun({ apiKey: process.env.MAILAPI, domain: 'mail.csivit.com', host: 'api.eu.mailgun.net' });

router.post('/login', async (req, res) => {
  try {
    const result = await adminFormSchema.validateAsync(req.body);
    const usr = await Admin.findOne({
      $and: [
        { uname: result.uname },
        { password: result.password }],
    });
    if (usr) {
      const token = jwt.sign({ uname: usr.uname }, process.env.JWTSECRET, { expiresIn: '1d' });
      if (!token) {
        res.json({ code: 0, msg: 'Invalid Token' });
        logger.error('Issue with JWT creation');
        return;
      }
      res.send(token);
    } else {
      res.json({ code: 0, msg: 'Forbidden' });
      logger.warn(`Unauthorized User tried to access /admin, Uname: ${req.body.uname} Pwd: ${req.body.password}`);
      return;
    }
  } catch (e) {
    if (e.isJoi === true) {
      res.status(422).json({ msg: `${e}` });
      logger.error(`${e}`);
    } else {
      logger.error(`Error in route (/login): ${e}`);
      res.status(500).json({ msg: `Error: ${e}` });
    }
  }
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

router.get('/events', verifyToken, async (req, res) => {
  try {
    const data = jwt.verify(req.token, process.env.JWTSECRET);
    if (data) {
      try {
        const events = await Events.find({});
        res.json(events);
      } catch (e) {
        res.status(500).json({ msg: `Error: ${e}` });
      }
    } else {
      res.sendStatus(403).send('Forbidden');
      logger.info('Attempt at acessing /events without auth');
    }
  } catch (e) {
    logger.error('Issue in route /auth');
  }
});

router.post('/approve/:id', verifyToken, async (req, res) => {
  try {
    const jwtData = jwt.verify(req.token, process.env.JWTSECRET);
    if (jwtData) {
      const result = await adminRouteSchema.validateAsync(req.params);
      const event = await Events.findOne({ _id: result.id });
      const data = {
        title: event.title,
        cname: event.cname,
        email: event.email,
        desc: event.desc,
        start: event.start,
        end: event.end,
        img: event.img,
        url: event.url,
        org: event.org,
        backgroundColor: event.backgroundColor,
        borderColor: event.backgroundColor,
        textColor: event.textColor,
      };
      const run = async (mailTo) => {
        const template = approved(event.title);
        const html = await inlineCSS(template, { url: 'fake' });
        await mailgun.messages().send({
          from: 'outreach@csivit.com',
          to: mailTo,
          subject: 'Email Verification',
          html,
          text: 'HTML not enabled',
        });
      };
      await run(event.email).catch((e) => {
        logger.error(`Couldn't send mail to ${event.email}: ${e}`);
      });
      await Approved.create(data);
      await Events.deleteOne({ _id: result.id });
      logger.info(`Event Approved ${event.title}`);
      res.status(200).json({ msg: 'Event Approved Successfully' });
    } else {
      res.sendStatus(403).send('Forbidden');
      logger.info('Attempt at acessing /approve without auth');
    }
  } catch (e) {
    res.json({ msg: 'error' });
    logger.error(`In route /approved: ${e}`);
  }
});

router.post('/deny/:id/:reason', verifyToken, async (req, res) => {
  try {
    const jwtData = jwt.verify(req.token, process.env.JWTSECRET);
    if (jwtData) {
      const result = await adminRouteSchema.validateAsync(req.params);
      const event = await Events.findOne({ _id: result.id });
      const run = async (mailTo) => {
        const template = denied(event.title, result.reason);
        const html = await inlineCSS(template, { url: 'fake' });

        await mailgun.messages().send({
          from: 'outreach@csivit.com',
          to: mailTo,
          subject: 'Email Verification',
          html,
          text: 'HTML not enabled',
        });
      };

      await run(event.email).catch((e) => {
        logger.error(`Couldn't send mail to ${event.email}: ${e}`);
      });
      await Events.deleteOne({ _id: result.id });
      logger.info(`Event Denied ${event.title}`);
      res.status(200).json({ msg: 'Event has been Denied' });
    } else {
      res.sendStatus(403).send('Forbidden');
      logger.info('Attempt at acessing /deny without auth');
    }
  } catch (e) {
    res.json({ msg: 'error' });
    logger.error(`In route /deny: ${e}`);
  }
});

router.post('/remove/:id/', verifyToken, async (req, res) => {
  const result = await adminRouteSchema.validateAsync(req.params);
  try {
    const jwtData = jwt.verify(req.token, process.env.JWTSECRET);
    if (jwtData) {
      await Approved.deleteOne({ _id: result.id });
      res.status(200).json({ msg: 'Event removed' });
      logger.info('Event Removed');
    } else {
      res.sendStatus(403).send('Forbidden');
      logger.info('Attempt at acessing /remove without auth');
    }
  } catch (e) {
    res.json({ msg: 'error' });
    logger.error(`Issue removing event with id: ${result.id}, error: ${e}`);
  }
});

module.exports = router;
