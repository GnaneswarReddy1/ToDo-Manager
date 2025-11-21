const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

// create
router.post('/', auth, async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user._id };
    const task = new Task(payload);
    await task.save();
    res.json(task);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// read (list with filters & search)
router.get('/', auth, async (req, res) => {
  try {
    const { q, tag, completed } = req.query;
    const filter = { userId: req.user._id };
    if (completed !== undefined) filter.completed = completed === 'true';
    if (tag) filter.tags = tag;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { notes: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ];
    const items = await Task.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// get single
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// update
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
