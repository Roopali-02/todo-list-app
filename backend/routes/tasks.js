const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

//Get all tasks 
router.get('/',async(req,res)=>{
  try{
    const tasks = await Task.find();
    res.json(tasks);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

//Create a New Task
router.post('/',async(req,res)=>{
  try{
    const { title, completed, priority, date } = req.body;
    const newTask = new Task({ title, completed, priority, date });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  }catch(err){
    res.status(400).json({ message: err.message });
  }
})

//Edit a Task
router.put('/:id',async(req,res)=>{
  try{
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  }catch(err){
    res.status(400).json({ message: err.message });
  }
})

// Delete a task
router.delete('/:id', async (req, res)=>{
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

module.exports = router;