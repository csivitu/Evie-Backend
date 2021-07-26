const express = require('express');
const jwt = require('jsonwebtoken');
const Mailgun = require('mailgun-js');
const inlineCSS = require('inline-css');
const router = express.Router();
const Events = require('../models/events');
const Approved = require('../models/approved');

const mailgun = new Mailgun({ apiKey: process.env.MAILAPI , domain: 'mail.csivit.com', host: 'api.eu.mailgun.net' });

router.get("/events", async (req, res) => {
    try {
        const events = await Events.find({});
        res.json(events);
    } catch (e) {
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.post('/approve/:id', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.params.id })
        const template = `Your application for the event (${event.title}) was approved.<br>`;
        const html = await inlineCSS(template, { url: 'fake' });

        await mailgun.messages().send({
            from: `outreach@csivit.com`,
            to: mailTo,
            subject: 'Event Application Approved',
            html,
            text: 'HTML not enabled'
        });

        await run(event.email).catch(e => {
            console.log(`Error in ${event.email}: ${e}`);
        });
        
        Approved.create(event);
        res.redirect("/admin")
    } catch (e) {
        res.send('error');
        console.log(e);
    }
});

router.get('/deny/:id', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.params.id })
        let { reason } = req.body;
        const template = `Your application for the event (${event.title}) was denied.<br>
        Reason: ${reason}`;
        const html = await inlineCSS(template, { url: 'fake' });

        await mailgun.messages().send({
            from: `outreach@csivit.com`,
            to: mailTo,
            subject: 'Event Application Denied',
            html,
            text: 'HTML not enabled'
        });

        await run(event.email).catch(e => {
            console.log(`Error in ${event.email}: ${e}`);
        });
        const resp = await Events.remove({ _id: id })
        res.redirect("/admin")
    } catch (e) {
        res.send('error');
        console.log(e);
    }
});

module.exports = router;