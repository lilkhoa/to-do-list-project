const Task = require('../models/Task');

class TaskController {

    // [GET] /task/create
    async create(req, res, next) {
        try {
            res.render('task/create', {
                error: req.query.error,
                success: req.query.success,
            });
        } catch (error) {
            console.error('Error rendering create task page:', error);
        }
    }

    // [POST] /task
    async createTask(req, res, next) {
        try {
            const { title, description, dueDate, dueTime } = req.body;

            if (!title || !description || !dueDate || !dueTime) {
                return res.status(400).send('All fields are required');
            }

            // Validate date and time
            const now = new Date();
            const dueDateTime = new Date(`${dueDate}T${dueTime}`);
            if (dueDateTime < now) {
                return res.redirect('/task/create?error=true');
            }

            const taskData = { title, description, dueDate, dueTime };
            const userId = req.session.user?.id;
            const taskId = await Task.create(taskData, userId);

            res.redirect(`/task/create?success=true`);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    }

    // [PUT] /task/:id/complete
    async completeTask(req, res, next) {
        try {
            const taskId = req.params.id;

            if (!taskId) {
                return res.status(400).send('Task ID is required');
            }

            await Task.complete(taskId);
            res.redirect('/task'); // Redirect to home or task list after completion
        } catch (error) {
            console.error('Error completing task:', error);
        }
    }

    // [PUT] /task/:id/incomplete
    async incompleteTask(req, res, next) {
        try {
            const taskId = req.params.id;

            if (!taskId) {
                return res.status(400).send('Task ID is required');
            }

            await Task.incomplete(taskId);
            res.redirect('/task'); // Redirect to home or task list after marking as incomplete
        } catch (error) {
            console.error('Error marking task as incomplete:', error);
        }
    }

    // [GET] /task/:id
    async renderTaskDetail(req, res, next) {
        try {
            const taskId = req.params.id;

            if (!taskId) {
                return res.status(400).send('Task ID is required');
            }

            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).send('Task not found');
            }

            res.render('task/detail', { task });
        } catch (error) {
            console.error('Error rendering task detail:', error);
        }
    }

    // [GET] /task/:id/edit
    async edit(req, res, next) {
        try {
            const taskId = req.params.id;

            if (!taskId) {
                return res.status(400).send('Task ID is required');
            }

            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).send('Task not found');
            }

            res.render('task/edit', { 
                task,
                error: req.query.error,
                success: req.query.success, 
            });
        } catch (error) {
            console.error('Error rendering edit task page:', error);
        }
    }

    // [PUT] /task/:id
    async updateTask(req, res, next) {
        try {
            const taskId = req.params.id;
            const { title, description, dueDate, dueTime } = req.body;

            if (!taskId || !title || !description || !dueDate || !dueTime) {
                return res.status(400).send('All fields are required');
            }

            // Validate date and time
            const now = new Date();
            const dueDateTime = new Date(`${dueDate}T${dueTime}`);
            if (dueDateTime < now) {
                return res.redirect(`/task/${taskId}/edit?error=true`);
            }

            const taskData = { title, description, dueDate, dueTime };
            await Task.update(taskId, taskData);

            res.redirect(`/task/${taskId}/edit?success=true`); 
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    // [DELETE] /task/:id
    async deleteTask(req, res, next) {
        try {
            const taskId = req.params.id;

            if (!taskId) {
                return res.redirect('/task?deletes-error=Task id is required');
            }

            await Task.delete(taskId);
            res.redirect('/task?deleted-success=true'); // Redirect to home or task list after deletion
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    // [GET] /task
    async index(req, res, next) {
        try {
            res.render('task/home');
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }

    // [GET] /task/trash
    async trash(req, res, next) {
        try {
            const userId = req.session.user?.id;
            const deletedTasks = await Task.findAllDeleted(userId);
            res.render('task/trash', { deletedTasks });
        } catch (error) {
            console.error('Error fetching trashed tasks:', error);
        }
    }

    // [PUT] /task/deleted/:id/restore
    async restoreTask(req, res, next) {
        try {
            const taskId = req.params.id;
            if (!taskId) {
                return res.redirect('/task/deleted/trash?restored-error=Task id is required');  
            }

            await Task.restore(taskId);
            res.redirect('/task/deleted/trash?restored-success=true');
        } catch (error) {
            console.error('Error restoring task:', error);
        }
    }

    // [DELETE] /task/deleted/:id/delete
    async permanentDeleteTask(req, res, next) {
        try {
            const taskId = req.params.id;
            if (!taskId) {
                return res.redirect('/task/deleted/trash?deleted-error=Task id is required');  
            }
            await Task.permanentDelete(taskId);
            res.redirect('/task/deleted/trash?deleted-success=true');
        } catch (error) {
            console.error('Error permanently deleting task:', error);
        }
    }

    // [DELETE] /task/deleted/empty-trash
    async emptyTrash(req, res, next) {
        try {
            const userId = req.session.user?.id;
            if (!userId) {
                return res.redirect('/task/deleted/trash?empty-trash-error=User id is required');
            }
            await Task.emptyTrash(userId);
            res.redirect('/task/deleted/trash?empty-trash-success=true');
        } catch (error) {
            console.error('Error emptying trash:', error);
        }
    }

    // [PUT] /task/bulk/bulk-complete
    async bulkComplete(req, res, next) {
        try {
            let taskIds = req.body['taskIds[]'];

            if (!Array.isArray(taskIds)) {
                taskIds = [taskIds]; // Ensure taskIds is an array
            }

            if (taskIds.length === 0) {
                return res.redirect('/task/bulk/bulk-action?bulk-complete-error=No tasks selected');
            }

            await Task.bulkComplete(taskIds);
            res.redirect(`/task/bulk/bulk-action?bulk-complete-success=${taskIds.length}`); 
        } catch (error) {
            console.error('Error completing tasks in bulk:', error);
        }
    }

    // [PUT] /task/bulk/bulk-incomplete
    async bulkIncomplete(req, res, next) {
        try {
            let taskIds = req.body['taskIds[]']; 

            if (!Array.isArray(taskIds)) {
                taskIds = [taskIds]; // Ensure taskIds is an array
            }

            if (taskIds.length === 0) {
                return res.redirect('/task/bulk/bulk-action?bulk-incomplete-error=No tasks selected');
            }

            await Task.bulkIncomplete(taskIds);
            res.redirect(`/task/bulk/bulk-action?bulk-incomplete-success=${taskIds.length}`);
        } catch (error) {
            console.error('Error marking tasks as incomplete in bulk:', error);
        }
    }

    // [DELETE] /task/bulk/bulk-delete
    async bulkDelete(req, res, next) {
        try {
            let taskIds = req.body['taskIds[]'];

            if (!Array.isArray(taskIds)) {
                taskIds = [taskIds]; // Ensure taskIds is an array
            }

            if (taskIds.length === 0) {
                return res.redirect('/task/bulk/bulk-action?bulk-delete-error=No tasks selected');
            }
            
            await Task.bulkDelete(taskIds);
            res.redirect(`/task/bulk/bulk-action?bulk-delete-success=${taskIds.length}`);
        } catch (error) {
            console.error('Error deleting tasks in bulk:', error);
        }
    }

    // [PUT] /task/deleted/bulk/bulk-restore
    async bulkRestore(req, res, next) {
        try {
            let taskIds = req.body['taskIds[]'];

            if (!Array.isArray(taskIds)) {
                taskIds = [taskIds]; // Ensure taskIds is an array
            }

            if (taskIds.length === 0) {
                return res.redirect('/task/deleted/trash?bulk-restore-error=No tasks selected');
            }

            await Task.bulkRestore(taskIds);
            res.redirect(`/task/deleted/trash?bulk-restore-success=${taskIds.length}`);
        } catch (error) {
            console.error('Error restoring tasks in bulk:', error);
        }
    }

    // [DELETE] /task/deleted/bulk/bulk-permanent-delete
    async bulkPermanentDelete(req, res, next) {
        try {
            let taskIds = req.body['taskIds[]'];

            if (!Array.isArray(taskIds)) {
                taskIds = [taskIds]; // Ensure taskIds is an array
            }

            if (taskIds.length === 0) {
                return res.redirect('/task/deleted/trash?bulk-permanent-delete-error=No tasks selected');
            }

            await Task.bulkPermanentDelete(taskIds);
            res.redirect(`/task/deleted/trash?bulk-permanent-delete-success=${taskIds.length}`);
        } catch (error) {
            console.error('Error permanently deleting tasks in bulk:', error);
        }
    }

    // [GET] /task/bulk/bulk-action
    async bulkAction(req, res, next) {
        try {
            const userId = req.session.user?.id;
            const tasks = await Task.findAll(userId);
            res.render('task/bulk-action', { tasks });
        } catch (error) {
            console.error('Error rendering bulk action page:', error);
        }
    }
}

module.exports = new TaskController();
