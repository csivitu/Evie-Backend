const express = require('express');
const jwt = require('jsonwebtoken');
const Mailgun = require('mailgun-js');
const inlineCSS = require('inline-css');
const router = express.Router();
const Events = require('../models/events');
const Approved = require('../models/approved');

const mailgun = new Mailgun({ apiKey: process.env.MAILAPI, domain: 'mail.csivit.com', host: 'api.eu.mailgun.net' });

router.get("/events", async (req, res) => {
    try {
        const events = await Events.find({});
        res.json(events);
    } catch (e) {
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.get('/approve/:id', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.params.id })
        const data = {
            title: event.title,
            email: event.email,
            desc: event.desc,
            start: event.start,
            start_time: event.start_time,
            end: event.end,
            end_time: event.end_time,
            img: event.img,
            url: event.url,
            org: event.org
          }
        async function run(mailTo) {
            const template = `Your application for the event (${event.title}) was approved.<br>`;
            const html = await inlineCSS(template, { url: 'fake' });

            await mailgun.messages().send({
                from: `outreach@csivit.com`,
                to: mailTo,
                subject: 'Email Verification',
                html,
                text: 'HTML not enabled'
            });
        }

        await run(event.email).catch(e => {
            console.log(`Error in ${event.email}: ${e}`);
        });

        await Approved.create(data);
        await Events.deleteOne({ _id: req.params.id })
        res.redirect("/admin")
    } catch (e) {
        res.send('error');
        console.log(e);
    }
});

router.get('/deny/:id/:reason', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.params.id })
        console.log(req.params.reason)

        async function run(mailTo) {
            const template = `Your application for the event (${event.title}) was denied.<br>
        Reason: ${req.params.reason}`;
            const html = await inlineCSS(template, { url: 'fake' });

            await mailgun.messages().send({
                from: `outreach@csivit.com`,
                to: mailTo,
                subject: 'Email Verification',
                html,
                text: 'HTML not enabled'
            });
        }

        await run(event.email).catch(e => {
            console.log(`Error in ${event.email}: ${e}`);
        });
        const resp = await Events.deleteOne({ _id: req.params.id })
        res.redirect("/admin")
    } catch (e) {
        res.send('error');
        console.log(e);
    }
});

module.exports = router;