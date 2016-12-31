const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Yea, right, fuck off.

const Schema = mongoose.Schema;

const VideoSchema = new Schema({
    // _id: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: false, default: ""},
    src: {type: String, required: true},
    length: {type: Number, required: true, min: [0, "Length too small"]},
    playcount: {type: Number, required: false, min: [0, "Playcount too small"], default: 0},
    ranking: {type: Number, required: false, min: [0, "Ranking too small"], default: 0}
}, {
    timestamps: {createdAt: 'timestamp'}
});

module.exports = mongoose.model('Video', VideoSchema);