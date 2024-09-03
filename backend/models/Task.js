const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  completed:{
    type:Boolean,
    default:false
  },
  priority: {
    type: String,
    default: 'Low',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
})

module.exports = mongoose.model('Task', TaskSchema);