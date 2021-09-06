const verify = (token, eventname, cname) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap');
        *{
            padding: 0;
            margin: 0;
            font-family: 'Ubuntu Mono', monospace;
        }
        img{
            margin-top: 15px;
        }
        .bg{
            width: 100%;
            height: 100%;
            background: url('https://cdn.discordapp.com/attachments/812342454820667443/872128867547103263/pattern.png');
            background-repeat: repeat;
            background-position: right top;
            padding-bottom: 100px;
            padding-top: 100px;
        }
        .box{
            margin: 0 auto !important;
            width: 50%;
            height: 50%;
            background-color: #2a2b2e;
            text-align: center;
            border: 1px solid #00c49a;
        }
        @media screen and (max-width: 830px) {
            .box{
                width: 90%;
                height: 50%;
            }
        }
        @media screen and (max-width: 830px) {
            .box{
                width: 90vw;
            }
        }
        .heading{
            color: #f0f8ff;
            padding: 15px 0 25px 0;
        }
        .text{
            margin-top: 15px;
            color: #f0f8ff;
        }
        .button {
            margin-top: 50px;
            text-decoration: none !important;
            display: inline-block;
            padding: 0.75rem 1.25rem;
            border-radius: 10rem;
            background-color: #00c49a;
            color: #fff !important;
            font-size: 1rem;
            letter-spacing: 0.15rem;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            z-index: 1;
            margin-bottom: 20px;
        }
        .button:hover {
            background-color: #fff;
            color: #00c49a !important;
        }
        .button:hover:before {
            width: 100%;
        }
        .link{
            color: #44b2dd;
        }
    </style>
</head>
<body>
    <div class="bg">
        <div class="box">
            <img src="https://cdn.discordapp.com/attachments/812342454820667443/872129994321711164/mail.png" alt="email" width="100px" height="100px">
            <h1 class="heading">Verify Your Email</h1>
            <p class="text">Almost There!</p>
            <p class="text">You need to verify your email by clicking the button below.</p>
            <p class="text">Event Name: ${eventname}</p>
            <p class="text">Co-ordinator Name: ${cname}</p>
            <a href="${process.env.BACKEND_BASEURL}/api/confirmation/${token}" class="button">Verify Email</a>
        </div>
    </div>
</body>
</html>
    `;

module.exports = verify;
