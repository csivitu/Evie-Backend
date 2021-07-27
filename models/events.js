const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    start: {
        type: Date,
        required: [true, 'Date is required']
    },
    start_time: {
        type: String,
        required: [true, 'Time is required']
    },
    end: {
        type: Date,
        required: [true, 'Date is required']
    },
    end_time: {
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
    },
    org: {
        type: String,
        required: [true, 'Organisation is required']
    }
    });

const Events = mongoose.model('event', EventSchema);
module.exports = Events;