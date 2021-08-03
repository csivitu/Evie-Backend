const express = require('express');
const jwt = require('jsonwebtoken');
const Mailgun = require('mailgun-js');
const inlineCSS = require('inline-css');

const router = express.Router();
const Events = require('../models/events');
const Approved = require('../models/approved');
const Admin = require('../models/admin');

const mailgun = new Mailgun({ apiKey: process.env.MAILAPI, domain: 'mail.csivit.com', host: 'api.eu.mailgun.net' });

router.post('/login', async (req, res) => {
  const usr = await Admin.findOne({
    $and: [
      { uname: req.body.uname },
      { password: req.body.password }],
  });
  if (usr) {
    const token = jwt.sign({ uname: usr.uname }, process.env.JWTSECRET, { expiresIn: '1d' });
    if (!token) {
      res.status(501).json({ msg: 'Invalid Token' });
      return;
    }
    res.send(token);
  } else {
    res.json({ msg: 'User Not Found or Invalid Credentials' });
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
      const template = `Your application for the event (${event.title}) was approved.<br>`;
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
      console.log(`Error in ${event.email}: ${e}`);
    });

    await Approved.create(data);
    await Events.deleteOne({ _id: req.params.id });
    res.redirect(`${process.env.FRONTEND_BASEURL}/admin`);
  } catch (e) {
    res.send('error');
    console.log(e);
  }
});

router.get('/deny/:id/:reason', async (req, res) => {
  try {
    const event = await Events.findOne({ _id: req.params.id });
    const run = async (mailTo) => {
      const template = `Your application for the event (${event.title}) was denied.<br>
        Reason: ${req.params.reason}`;
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
      console.log(`Error in ${event.email}: ${e}`);
    });
    await Events.deleteOne({ _id: req.params.id });
    res.redirect(`${process.env.FRONTEND_BASEURL}/admin`);
  } catch (e) {
    res.send('error');
    console.log(e);
  }
});

router.get('/remove/:id/', async (req, res) => {
  try {
    await Approved.deleteOne({ _id: req.params.id });
    res.redirect(`${process.env.FRONTEND_BASEURL}/admin`);
  } catch (e) {
    res.send('error');
    console.log(e);
  }
});

module.exports = router;
