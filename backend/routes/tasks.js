const express = require('express');
const multer = require('multer');
const Task = require('../models/Task');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to determine the task's display status
const getDisplayStatus = (task) => {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const createdOn = new Date(task.createdOn);

  if (task.status === 'DONE' && now > deadline) {
    return 'Achieved';
  } else if (task.status === 'TODO' && now > deadline) {
    return 'Failed';
  } else if (now >= createdOn && now <= deadline) {
    return 'In Progress';
  } else {
    // This case handles 'DONE' tasks before the deadline and other edge cases
    return task.status;
  }
};

// GET all tasks with calculated display status
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    const tasksWithStatus = tasks.map(task => {
      const taskObject = task.toObject();
      taskObject.displayStatus = getDisplayStatus(taskObject);
      return taskObject;
    });
    res.json(tasksWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new task (with optional file upload)
router.post('/', upload.single('linkedFile'), async (req, res) => {
  const { title, description, deadline } = req.body;
  const linkedFile = req.file;

  if (!title || !description || !deadline) {
    return res.status(400).json({ message: 'Title, description, and deadline are required.' });
  }

  const newTaskData = {
    title,
    description,
    deadline: new Date(deadline)
  };

  if (linkedFile) {
    newTaskData.linkedFile = {
      data: linkedFile.buffer,
      contentType: linkedFile.mimetype
    };
  }

  const task = new Task(newTaskData);

  try {
    const savedTask = await task.save();
    // Add displayStatus before sending back
    const savedTaskObject = savedTask.toObject();
    savedTaskObject.displayStatus = getDisplayStatus(savedTaskObject);
    res.status(201).json(savedTaskObject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET a single task file
router.get('/:id/file', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !task.linkedFile || !task.linkedFile.data) {
      return res.status(404).json({ message: 'File not found.' });
    }

    res.set('Content-Type', task.linkedFile.contentType);
    res.set('Content-Disposition', `attachment; filename="task-file-${req.params.id}.pdf"`);
    res.send(task.linkedFile.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a task
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const { title, description, deadline, status } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (deadline) task.deadline = new Date(deadline);
    if (status) task.status = status;

    const updatedTask = await task.save();
    // Add displayStatus before sending back
    const updatedTaskObject = updatedTask.toObject();
    updatedTaskObject.displayStatus = getDisplayStatus(updatedTaskObject);
    res.json(updatedTaskObject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;