import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchEventBudget,
    createOrUpdateBudget,
    addNewExpense,
    modifyExpense,
    deleteExpenseById,
} from '../../store/slices/budgetSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';
import { SUCCESS_MESSAGES } from '../../utils/notifications';

const CHART_COLORS = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f97316',
    '#ec4899', '#14b8a6', '#6366f1', '#ef4444',
];

const BudgetOverview = ({ eventId }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.auth);
    const { budget, expenses } = useSelector(state => state.budget);

    // Local UI state 
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [expenseFormData, setExpenseFormData] = useState({ category: '', amount: '', paidStatus: false });
    const [errors, setErrors] = useState({});
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, expenseId: null, expenseCategory: '' });
    const [saving, setSaving] = useState(false);

    // Self-sufficient data loading 
    const loadBudget = useCallback(async () => {
        if (!eventId || !userData?.userId) return;
        await dispatch(fetchEventBudget(eventId, userData.userId));
    }, [dispatch, eventId, userData?.userId]);

    useEffect(() => {
        loadBudget();
    }, [loadBudget]);

    useEffect(() => {
        if (budget) setBudgetAmount(budget.totalBudget.toString());
    }, [budget]);

    // Derived chart data 
    const categoryData = expenses.reduce((acc, exp) => {
        const cat = exp.category || 'Other';
        acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
        return acc;
    }, {});

    const totalSpent = Object.values(categoryData).reduce((s, v) => s + v, 0);
    const chartEntries = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount], i) => ({
            category,
            amount,
            percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));

    const paidTotal = expenses.filter(e => e.paidStatus).reduce((s, e) => s + (e.amount || 0), 0);
    const unpaidTotal = expenses.filter(e => !e.paidStatus).reduce((s, e) => s + (e.amount || 0), 0);
    // Use expenses-derived totalSpent as the single source of truth (budget.totalSpent in Firestore
    // may lag — this is always accurate since expenses are in Redux state already)

    const computedTotalBudget = budget ? Math.round((budget.totalBudget || 0) * 100) / 100 : 0;
    const computedRemainingBudget = computedTotalBudget - totalSpent;
    const budgetExceeded = computedTotalBudget > 0 && totalSpent > computedTotalBudget;
    const usedPercent = computedTotalBudget > 0
        ? Math.min((totalSpent / computedTotalBudget) * 100, 100)
        : 0;

    //  Handlers 
    const handleSetBudget = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!validatePositiveNumber(budgetAmount)) {
            setErrors({ budget: 'Please enter a valid budget amount' });
            return;
        }
        setSaving(true);
        const result = await dispatch(createOrUpdateBudget(
            { totalBudget: parseFloat(budgetAmount) }, eventId, userData.userId
        ));
        setSaving(false);
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
        setExpenseFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateExpense = () => {
        const newErrors = {};
        if (!validateRequired(expenseFormData.category)) newErrors.category = 'Category is required';
        if (!validateRequired(expenseFormData.amount)) newErrors.amount = 'Amount is required';
        else if (!validatePositiveNumber(expenseFormData.amount)) newErrors.amount = 'Please enter a valid amount';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleExpenseSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!validateExpense()) return;

        setSaving(true);
        const expenseData = {
            category: expenseFormData.category,
            amount: parseFloat(expenseFormData.amount),
            paidStatus: expenseFormData.paidStatus,
        };

        // Step 1: Ensure a budget exists (auto-create $0 budget if needed)
        let budgetId = budget?.id;
        if (!budgetId) {
            const budgetResult = await dispatch(createOrUpdateBudget(
                { totalBudget: 0 }, eventId, userData.userId
            ));
            if (!budgetResult.success) {
                dispatch(showNotification('Could not initialise budget', 'error'));
                setSaving(false);
                return;
            }
            budgetId = budgetResult.id;
        }

        // Step 2: Add / update expense
        let result;
        if (editingExpense) {
            result = await dispatch(modifyExpense(editingExpense.id, expenseData, budgetId, eventId, userData.userId));
            if (result.success) dispatch(showNotification(SUCCESS_MESSAGES.EXPENSE_UPDATED, 'success'));
        } else {
            result = await dispatch(addNewExpense(expenseData, budgetId, eventId, userData.userId));
            if (result.success) dispatch(showNotification(SUCCESS_MESSAGES.EXPENSE_ADDED, 'success'));
        }

        setSaving(false);
        if (!result.success) {
            dispatch(showNotification('Failed to save expense', 'error'));
        }
        setIsExpenseModalOpen(false);
    };

    const handleDeleteExpense = async () => {
        if (!budget?.id) return;
        await dispatch(deleteExpenseById(deleteModal.expenseId, budget.id, eventId, userData.userId));
        dispatch(showNotification(SUCCESS_MESSAGES.EXPENSE_DELETED, 'success'));
        setDeleteModal({ isOpen: false, expenseId: null, expenseCategory: '' });
    };

    // Rendering
    return (
        <div className="space-y-6">

            {/* Budget Summary Card */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Budget Overview</h2>
                    <Button variant="secondary" size="small" onClick={() => setIsBudgetModalOpen(true)} className="flex items-center gap-2">
                        <FiEdit size={14} />
                        {budget ? 'Edit Budget' : 'Set Budget'}
                    </Button>
                </div>

                {budget ? (
                    <>
                        {/* Budget Exceeded Alert */}
                        {budgetExceeded && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                    ⚠️ Budget exceeded by ${Math.abs(computedRemainingBudget).toFixed(2)}! Total spent ${totalSpent.toFixed(2)} exceeds your ${computedTotalBudget.toFixed(2)} budget.
                                </p>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Budget</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">${computedTotalBudget.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
                                <p className={`text-xl font-bold ${budgetExceeded ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>${totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                                <p className={`text-xl font-bold ${computedRemainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ${computedRemainingBudget.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid / Unpaid</p>
                                <p className="text-sm font-semibold">
                                    <span className="text-green-500">${paidTotal.toFixed(0)}</span>
                                    <span className="text-gray-400 mx-1">/</span>
                                    <span className="text-yellow-500">${unpaidTotal.toFixed(0)}</span>
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {budget.totalBudget > 0 && (
                            <div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${usedPercent}%`,
                                            backgroundColor: budgetExceeded ? '#ef4444' : '#3b82f6'
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                                    {Math.round(usedPercent)}% used
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10">
                        <FiDollarSign className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No budget set yet. You can also add expenses directly — a budget record will be created automatically.</p>
                        <Button variant="primary" onClick={() => setIsBudgetModalOpen(true)}>Set Budget Limit</Button>
                    </div>
                )}
            </Card>

            {/* Spending Distribution Chart */}
            {chartEntries.length > 0 && (
                <Card>
                    <div className="flex items-center gap-2 mb-5">
                        <FiBarChart2 className="text-blue-500" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spending Distribution</h2>
                        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Total: ${totalSpent.toFixed(2)}</span>
                    </div>

                    {/* Bar chart */}
                    <div className="space-y-4">
                        {chartEntries.map((entry, i) => (
                            <div key={entry.category}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                        {entry.category}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        ${entry.amount.toFixed(2)} · {entry.percent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-4 rounded-full transition-all duration-700"
                                        style={{ width: `${entry.percent}%`, backgroundColor: entry.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend dots row */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {chartEntries.map((entry) => (
                            <span key={entry.category} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.category}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Expenses Table — always visible so user can add without setting budget first */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Expenses</h2>
                    <Button variant="primary" onClick={handleAddExpense} className="flex items-center gap-2">
                        <FiPlus size={16} /> Add Expense
                    </Button>
                </div>

                {expenses.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet. Click "Add Expense" to start tracking costs.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Category', 'Amount', 'Status', 'Actions'].map(h => (
                                        <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{expense.category}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${(expense.amount || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${expense.paidStatus
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                                                {expense.paidStatus ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button onClick={() => handleEditExpense(expense)} className="text-blue-500 hover:text-blue-700">
                                                <FiEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, expenseId: expense.id, expenseCategory: expense.category })}
                                                className="text-red-500 hover:text-red-700"
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

            {/* Set/Edit Budget Modal */}
            <Modal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                title={budget ? 'Edit Budget' : 'Set Budget'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSetBudget} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <Input
                    label="Total Budget ($)"
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => { setBudgetAmount(e.target.value); setErrors({}); }}
                    error={errors.budget}
                    placeholder="5000"
                    min="0"
                    step="0.01"
                />
            </Modal>

            {/* Add/Edit Expense Modal */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                title={editingExpense ? 'Edit Expense' : 'Add Expense'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleExpenseSubmit} disabled={saving}>
                            {saving ? 'Saving...' : editingExpense ? 'Update' : 'Add'}
                        </Button>
                    </>
                }
            >
                <Input label="Category" name="category" value={expenseFormData.category} onChange={handleExpenseChange} error={errors.category} placeholder="Venue, Catering, Decorations..." />
                <Input label="Amount ($)" type="number" name="amount" value={expenseFormData.amount} onChange={handleExpenseChange} error={errors.amount} placeholder="500.00" min="0" step="0.01" />
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" name="paidStatus" checked={expenseFormData.paidStatus} onChange={handleExpenseChange} className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mark as paid</span>
                </label>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, expenseId: null, expenseCategory: '' })}
                title="Delete Expense"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, expenseId: null, expenseCategory: '' })}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteExpense}>Delete</Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete "<strong>{deleteModal.expenseCategory}</strong>"?
                </p>
            </Modal>
        </div>
    );
};

export default BudgetOverview;
