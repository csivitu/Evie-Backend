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

const mailgun = new Mailgun({ apiKey: process.env.MAILAPI, domain: 'mail.csivit.com', host: 'api.eu.mailgun.net' });

router.post('/login', async (req, res) => {
  try {
    const usr = await Admin.findOne({
      $and: [
        { uname: req.body.uname },
        { password: req.body.password }],
    });
    if (usr) {
      const token = jwt.sign({ uname: usr.uname }, process.env.JWTSECRET, { expiresIn: '1d' });
      if (!token) {
        res.status(501).json({ msg: 'Invalid Token' });
        logger.error('Issue with JWT creation');
        res.redirect(`${process.env.FRONTEND_BASEURL}/login`);
      }
      res.send(token);
    } else {
      res.redirect(`${process.env.FRONTEND_BASEURL}/login`);
      logger.warn(`Unauthorized User tried to access /admin, Uname: ${req.body.uname} Pwd: ${req.body.password}`);
    }
  } catch (e) {
    logger.error(`Error in route (/login): ${e}`);
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

router.get('/approve/:id', async (req, res) => {
  try {
    const event = await Events.findOne({ _id: req.params.id });
    const data = {
      title: event.title,
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
      // console.log(`Error in ${event.email}: ${e}`);
      logger.error(`Couldn't send mail to ${req.body.email}: ${e}`);
    });

    await Approved.create(data);
    await Events.deleteOne({ _id: req.params.id });
    logger.info(`Event Approved ${event.title}`);
    res.redirect(`${process.env.FRONTEND_BASEURL}/admin`);
  } catch (e) {
    res.send('error');
    // console.log(e);
    logger.error(`In route /approved: ${e}`);
  }
});

router.get('/deny/:id/:reason', async (req, res) => {
  try {
    const event = await Events.findOne({ _id: req.params.id });
    const run = async (mailTo) => {
      const template = denied(event.title, req.params.reason);
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
      // console.log(`Error in ${event.email}: ${e}`);
      logger.error(`Couldn't send mail to ${req.body.email}: ${e}`);
    });
    await Events.deleteOne({ _id: req.params.id });
    logger.info(`Event Denied ${event.title}`);
    res.redirect(`${process.env.FRONTEND_BASEURL}/admin`);
  } catch (e) {
    res.send('error');
    // console.log(e);
    logger.error(`In route /deny: ${e}`);
  }
});

router.get('/remove/:id/', async (req, res) => {
  try {
    await Approved.deleteOne({ _id: req.params.id });
    res.redirect(`${process.env.FRONTEND_BASEURL}/admin`);
    logger.info('Event Removed');
  } catch (e) {
    res.send('error');
    // console.log(e);
    logger.error(`Issue approving event with id: ${req.params.id}, error: ${e}`);
  }
});

module.exports = router;
