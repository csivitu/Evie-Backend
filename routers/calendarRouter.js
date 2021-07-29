const express = require('express');
const jwt = require('jsonwebtoken');
const Mailgun = require('mailgun-js');
const inlineCSS = require('inline-css');
const router = express.Router();
const Events = require('../models/events');
const Approved = require('../models/approved');

router.get('/calendar', async (req, res) => {
    try {
        const events = await Approved.find({});
        res.json(events);
    } catch (e) {
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.post('/date', async (req, res) => {
    try {
        const date = new Date(req.body.date);
        console.log(date)
        const events = await Approved.find({ $and: [{ start: { $lte: date.setHours(23, 59, 59, 999) } }, { end: { $gte: date.setHours(0, 0, 0, 0) } }] });
        res.json(events);
    } catch (e) {
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.post('/month', async (req, res) => {
    try {
        const begin = new Date(req.body.begin);
        const end = new Date(req.body.end);
        const events = await Approved.find({start : {$gte: begin, $lte: end}});
        res.json(events);
    } catch (e) {
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.post('/add', async (req, res) => {
    console.log(req.body);
    try {
        const mailgun = new Mailgun({ apiKey: process.env.MAILAPI, domain: 'mail.csivit.com', host: 'api.eu.mailgun.net' });
        const token = jwt.sign(req.body, process.env.JWTSECRET, { expiresIn: '1d' });
        if (!token) {
            res.status(501).json({ msg: 'Invalid Token' });
            return;
        }
        async function run(mailTo) {
            const template = `Follow this link to confirm your email <br>
            <a href="http://localhost:3001/api/confirmation/${token}">Click here to Verify Email</a>`;
            const html = await inlineCSS(template, { url: 'fake' });

            await mailgun.messages().send({
                from: `outreach@csivit.com`,
                to: mailTo,
                subject: 'Email Verification',
                html,
                text: 'HTML not enabled'
            });
        }
        await run(req.body.email).catch(e => {
            console.log(`Error in ${req.body.email}: ${e}`);
        });
        res.redirect("http://localhost:3000/verify")
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.get('/confirmation/:token', async (req, res) => {
    try {
        console.log(req.params.token);
        const data = jwt.verify(req.params.token, process.env.JWTSECRET);
        console.log(data);
        let { title, email, desc, start, end, img, url, org, backgroundColor, textColor } = data;
        const borderColor = backgroundColor;
        const resp = await Events.create({
            title,
            email,
            desc,
            start,
            end,
            img,
            url,
            org,
            backgroundColor,
            borderColor,
            textColor
        })
        res.redirect("http://localhost:3000/thankyou")
    } catch (e) {
        res.send('error');
        console.log(e);
    }
});

module.exports = router;