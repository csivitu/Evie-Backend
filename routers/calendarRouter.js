const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();
const Events = require('../models/events');


router.get("/calendar", async (req, res) => {
    try {
        const events = await Events.find({});
        console.log(events);
        res.json(events);
    } catch (e) {
        res.status(500).json({ msg: 'Error: ' + e });
    }
});

router.post('/add', async (req, res) => {
    console.log(req.body);
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            },
            //to enable localhost for now
            tls: {
                rejectUnauthorized: false
            }
        });

        jwt.sign(req.body, process.env.JWTSECRET, { expiresIn: '1d' }, (err, token) => {
            if (!err) {
                res.json({
                    token: token
                });
                let mailOptions = {
                    from: '"CSI_VIT" <your@email.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Email Confirmation', // Subject line
                    html: `Follow this link to confirm your email <br>
                    <a href="http://localhost:3001/api/confirmation/${token}">Click here to Verify Email</a>`, // plain text body
                    //html: output // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                });
            }
        });
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
        let { title, email, desc, date, time, img, url } = data;
        const resp = await Events.create({
            title,
            email,
            desc,
            date,
            time,
            img,
            url
        })
        res.redirect("/?msg=Success")
    } catch (e) {
        res.send('error');
        console.log(e);
    }
});

module.exports = router;