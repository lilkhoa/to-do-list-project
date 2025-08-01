const express = require('express');
const router = express.Router();
const taskController = require('../app/controllers/TaskController');

router.get('/create', taskController.create);
router.post('/', taskController.createTask);

router.put('/:id/complete', taskController.completeTask);
router.put('/:id/incomplete', taskController.incompleteTask);

router.get('/:id', taskController.renderTaskDetail);

router.get('/:id/edit', taskController.edit);
router.put('/:id', taskController.updateTask);

router.delete('/:id/delete', taskController.deleteTask);

router.get('/deleted/trash', taskController.trash);
router.put('/deleted/:id/restore', taskController.restoreTask);
router.delete('/deleted/:id/delete', taskController.permanentDeleteTask);
router.delete('/deleted/empty-trash', taskController.emptyTrash);

router.get('/', taskController.index); // List all tasks

module.exports = router;
