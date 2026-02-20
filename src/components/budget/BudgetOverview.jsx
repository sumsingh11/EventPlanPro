import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    createOrUpdateBudget,
    addNewExpense,
    modifyExpense,
    deleteExpenseById,
    selectBudgetExceeded
} from '../../store/slices/budgetSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';
import { SUCCESS_MESSAGES } from '../../utils/notifications';

const BudgetOverview = ({ eventId }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.auth);
    const { budget, expenses } = useSelector(state => state.budget);
    const budgetExceeded = useSelector(selectBudgetExceeded);

    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [expenseFormData, setExpenseFormData] = useState({
        category: '',
        amount: '',
        paidStatus: false,
    });
    const [errors, setErrors] = useState({});

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, expenseId: null, expenseCategory: '' });

    useEffect(() => {
        if (budget) {
            setBudgetAmount(budget.totalBudget.toString());
        }
    }, [budget]);

    const handleSetBudget = async (e) => {
        e.preventDefault();

        if (!validatePositiveNumber(budgetAmount)) {
            setErrors({ budget: 'Please enter a valid budget amount' });
            return;
        }

        const result = await dispatch(createOrUpdateBudget(
            { totalBudget: parseFloat(budgetAmount) },
            eventId,
            userData.userId
        ));

        if (result.success) {
            dispatch(showNotification(SUCCESS_MESSAGES.BUDGET_UPDATED, 'success'));
            setIsBudgetModalOpen(false);
        }
    };

    const handleAddExpense = () => {
        setEditingExpense(null);
        setExpenseFormData({ category: '', amount: '', paidStatus: false });
        setErrors({});
        setIsExpenseModalOpen(true);
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setExpenseFormData({
            category: expense.category,
            amount: expense.amount.toString(),
            paidStatus: expense.paidStatus,
        });
        setErrors({});
        setIsExpenseModalOpen(true);
    };

    const handleExpenseChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExpenseFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateExpense = () => {
        const newErrors = {};

        if (!validateRequired(expenseFormData.category)) {
            newErrors.category = 'Category is required';
        }

        if (!validateRequired(expenseFormData.amount)) {
            newErrors.amount = 'Amount is required';
        } else if (!validatePositiveNumber(expenseFormData.amount)) {
            newErrors.amount = 'Please enter a valid amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!validateExpense()) return;

        if (!budget) {
            dispatch(showNotification('Please set a budget first', 'warning'));
            return;
        }

        const expenseData = {
            category: expenseFormData.category,
            amount: parseFloat(expenseFormData.amount),
            paidStatus: expenseFormData.paidStatus,
        };

        let result;
        if (editingExpense) {
            result = await dispatch(modifyExpense(editingExpense.id, expenseData, budget.id, eventId));
            if (result.success) {
                dispatch(showNotification(SUCCESS_MESSAGES.EXPENSE_UPDATED, 'success'));
            }
        } else {
            result = await dispatch(addNewExpense(expenseData, budget.id, eventId, userData.userId));
            if (result.success) {
                dispatch(showNotification(SUCCESS_MESSAGES.EXPENSE_ADDED, 'success'));
            }
        }

        setIsExpenseModalOpen(false);
    };

    const handleDeleteExpense = async () => {
        await dispatch(deleteExpenseById(deleteModal.expenseId, budget.id, eventId));
        dispatch(showNotification(SUCCESS_MESSAGES.EXPENSE_DELETED, 'success'));
        setDeleteModal({ isOpen: false, expenseId: null, expenseCategory: '' });
    };

    return (
        <div className="space-y-6">


            {/* Budget Summary */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Budget Overview</h2>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setIsBudgetModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <FiEdit size={14} />
                        {budget ? 'Edit Budget' : 'Set Budget'}
                    </Button>
                </div>

                {budget ? (
                    <>
                        {budgetExceeded && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                <FiAlertCircle className="text-red-600 dark:text-red-400" size={20} />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                    Budget exceeded!
                                </p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    ${budget.totalBudget.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    ${budget.totalSpent.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                                <p className={`text-2xl font-bold ${budget.remainingBudget >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    ${budget.remainingBudget.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 ${budgetExceeded ? 'bg-red-600' : 'bg-primary-600'
                                    }`}
                                style={{ width: `${Math.min((budget.totalSpent / budget.totalBudget) * 100, 100)}%` }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <FiDollarSign className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No budget set yet</p>
                        <Button variant="primary" onClick={() => setIsBudgetModalOpen(true)}>
                            Set Budget
                        </Button>
                    </div>
                )}
            </Card>



            {/* Expenses */}
            {budget && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Expenses</h2>
                        <Button
                            variant="primary"
                            onClick={handleAddExpense}
                            className="flex items-center gap-2"
                        >
                            <FiPlus size={16} />
                            Add Expense
                        </Button>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No expenses recorded yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                {expense.category}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                ${expense.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${expense.paidStatus
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                    }`}>
                                                    {expense.paidStatus ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm space-x-2">
                                                <button
                                                    onClick={() => handleEditExpense(expense)}
                                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                                >
                                                    <FiEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, expenseId: expense.id, expenseCategory: expense.category })}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}



            {/* Budget Modal */}
            <Modal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                title={budget ? 'Edit Budget' : 'Set Budget'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsBudgetModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSetBudget}>
                            Save
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSetBudget}>
                    <Input
                        label="Total Budget"
                        type="number"
                        name="budget"
                        value={budgetAmount}
                        onChange={(e) => {
                            setBudgetAmount(e.target.value);
                            setErrors({});
                        }}
                        error={errors.budget}
                        placeholder="5000"
                        min="0"
                        step="0.01"
                        required
                    />
                </form>
            </Modal>



            {/* Expense Modal */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                title={editingExpense ? 'Edit Expense' : 'Add Expense'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleExpenseSubmit}>
                            {editingExpense ? 'Update' : 'Add'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleExpenseSubmit}>
                    <Input
                        label="Category"
                        name="category"
                        value={expenseFormData.category}
                        onChange={handleExpenseChange}
                        error={errors.category}
                        placeholder="Venue, Catering, Decorations, etc."
                        required
                    />

                    <Input
                        label="Amount"
                        type="number"
                        name="amount"
                        value={expenseFormData.amount}
                        onChange={handleExpenseChange}
                        error={errors.amount}
                        placeholder="500.00"
                        min="0"
                        step="0.01"
                        required
                    />

                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="paidStatus"
                                checked={expenseFormData.paidStatus}
                                onChange={handleExpenseChange}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Marked as paid</span>
                        </label>
                    </div>
                </form>
            </Modal>



            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, expenseId: null, expenseCategory: '' })}
                title="Delete Expense"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, expenseId: null, expenseCategory: '' })}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteExpense}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete the expense "{deleteModal.expenseCategory}"?
                </p>
            </Modal>
        </div>
    );
};

export default BudgetOverview;
