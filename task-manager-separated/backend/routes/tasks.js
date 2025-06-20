const express = require('express');
const router = express.Router();
const TaskService = require('../data/tasks');

// Input validation middleware
const validateTaskInput = (req, res, next) => {
    const { title, completed } = req.body;
    
    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
        return res.status(400).json({ 
            error: 'Title must be a non-empty string',
            received: title
        });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ 
            error: 'Completed must be a boolean value',
            received: typeof completed
        });
    }

    next();
};

// ID validation middleware
const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
            error: 'Invalid ID - must be a positive integer',
            received: req.params.id
        });
    }
    req.taskId = id;
    next();
};

// GET /api/tasks - Get all tasks with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const tasks = await TaskService.getAllTasks(parseInt(page), parseInt(limit));
        
        res.json({
            success: true,
            data: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: await TaskService.getTotalCount()
            }
        });
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tasks',
            details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', validateId, async (req, res) => {
    try {
        const task = await TaskService.getTaskById(req.taskId);
        if (!task) {
            return res.status(404).json({ 
                error: `Task ${req.taskId} not found` 
            });
        }
        res.json({ 
            success: true, 
            data: task 
        });
    } catch (error) {
        console.error(`Failed to fetch task ${req.taskId}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch task',
            taskId: req.taskId
        });
    }
});

// POST /api/tasks - Create new task
router.post('/', validateTaskInput, async (req, res) => {
    try {
        const { title, completed = false } = req.body;
        const newTask = await TaskService.createTask({
            title: title.trim(),
            completed
        });

        res.status(201).json({
            success: true,
            data: newTask,
            links: {
                self: `/api/tasks/${newTask.id}`,
                all: '/api/tasks'
            }
        });
    } catch (error) {
        console.error('Task creation failed:', error);
        res.status(500).json({ 
            error: 'Task creation failed',
            details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', validateId, validateTaskInput, async (req, res) => {
    try {
        const updates = {};
        if (req.body.title) updates.title = req.body.title.trim();
        if (req.body.completed !== undefined) updates.completed = req.body.completed;

        const updatedTask = await TaskService.updateTask(req.taskId, updates);
        if (!updatedTask) {
            return res.status(404).json({ 
                error: `Task ${req.taskId} not found` 
            });
        }

        res.json({
            success: true,
            data: updatedTask,
            changes: updates
        });
    } catch (error) {
        console.error(`Failed to update task ${req.taskId}:`, error);
        res.status(500).json({ 
            error: 'Task update failed',
            taskId: req.taskId
        });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', validateId, async (req, res) => {
    try {
        const success = await TaskService.deleteTask(req.taskId);
        if (!success) {
            return res.status(404).json({ 
                error: `Task ${req.taskId} not found` 
            });
        }
        res.status(204).end();
    } catch (error) {
        console.error(`Failed to delete task ${req.taskId}:`, error);
        res.status(500).json({ 
            error: 'Task deletion failed',
            taskId: req.taskId
        });
    }
});

module.exports = router;