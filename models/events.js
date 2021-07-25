const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create user Schema & model
const EventSchema = new Schema({
    title:{
        type: String,
        required: [true, 'Title is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    desc: {
    	type: String,
        required: [true, 'Description is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true, 'Time is required']
    },
    img: {
        type: String,
        required: [true, 'Image is required']
    },
    url: {
        type: String,
        required: [true, 'URL is required']
    }
    });

const Events = mongoose.model('event', EventSchema);
module.exports = Events;