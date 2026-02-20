import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addNewTask,
    modifyTask,
    deleteTaskById,
    toggleTask,
    setStatusFilter,
    selectFilteredTasks,
    selectTaskProgress
} from '../../store/slices/taskSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { validateRequired } from '../../utils/validation';
import { formatDate } from '../../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../../utils/notifications';

const TaskList = ({ eventId }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.auth);
    const tasks = useSelector(selectFilteredTasks);
    const taskProgress = useSelector(selectTaskProgress);
    const { statusFilter } = useSelector(state => state.tasks);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
    });
    const [errors, setErrors] = useState({});

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null, taskTitle: '' });

    const handleAdd = () => {
        setEditingTask(null);
        setFormData({ title: '', dueDate: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            dueDate: task.dueDate,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.title)) {
            newErrors.title = 'Title is required';
        }

        if (!validateRequired(formData.dueDate)) {
            newErrors.dueDate = 'Due date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let result;
        if (editingTask) {
            result = await dispatch(modifyTask(editingTask.id, formData));
            if (result.success) {
                dispatch(showNotification(SUCCESS_MESSAGES.TASK_UPDATED, 'success'));
            }
        } else {
            result = await dispatch(addNewTask(formData, eventId, userData.userId));
            if (result.success) {
                dispatch(showNotification(SUCCESS_MESSAGES.TASK_ADDED, 'success'));
            }
        }

        setIsModalOpen(false);
    };

    const handleToggle = async (task) => {
        await dispatch(toggleTask(task.id, task.status));
    };

    const handleDelete = async () => {
        await dispatch(deleteTaskById(deleteModal.taskId));
        dispatch(showNotification(SUCCESS_MESSAGES.TASK_DELETED, 'success'));
        setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {taskProgress}% completed
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleAdd}
                    className="flex items-center gap-2"
                >
                    <FiPlus size={16} />
                    Add Task
                </Button>
            </div>



            {/* Progress Bar */}
            <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${taskProgress}%` }}
                    />
                </div>
            </div>


            {/* Status Filter */}
            <div className="mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Task List */}
            {tasks.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No tasks added yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <button
                                    onClick={() => handleToggle(task)}
                                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status
                                            ? 'bg-primary-600 border-primary-600'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-600'
                                        }`}
                                >
                                    {task.status && <FiCheckCircle className="text-white" size={14} />}
                                </button>

                                <div className="flex-1">
                                    <p className={`text-gray-900 dark:text-gray-100 ${task.status ? 'line-through opacity-60' : ''}`}>
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Due: {formatDate(task.dueDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(task)}
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                >
                                    <FiEdit size={16} />
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, taskId: task.id, taskTitle: task.title })}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTask ? 'Edit Task' : 'Add Task'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingTask ? 'Update' : 'Add'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Task Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        error={errors.title}
                        placeholder="Prepare invitations"
                        required
                    />

                    <Input
                        label="Due Date"
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        error={errors.dueDate}
                        required
                    />
                </form>
            </Modal>


            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' })}
                title="Delete Task"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' })}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete "{deleteModal.taskTitle}"?
                </p>
            </Modal>
        </Card>
    );
};

export default TaskList;
