import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../store/slices/eventSlice';
import { getUserExpenses } from '../services/budgetService';
import { getUserTasks } from '../services/taskService';
import { getUserGuests } from '../services/guestService';
import { FiTrendingUp, FiCalendar, FiUsers, FiDollarSign, FiCheckSquare, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import CountdownTimer from '../components/ui/CountdownTimer';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#f97316', '#14b8a6'];

const BarChart = ({ data, maxValue, colorFn }) => (
    <div className="space-y-3">
        {data.map((item, i) => {
            const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
                <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[60%]">{item.label}</span>
                        <span className="text-gray-500 dark:text-gray-400">{item.displayValue ?? item.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                            className="h-4 rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: colorFn ? colorFn(i) : CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                    </div>
                </div>
            );
        })}
    </div>
);

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
    <Card>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}22` }}>
                <Icon size={22} style={{ color }} />
            </div>
        </div>
    </Card>
);

const Insights = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.auth);
    // Use raw events list — not filtered by search/tab/sort from dashboard state
    const events = useSelector(state => state.events.events);

    const [tasks, setTasks] = useState([]);
    const [guests, setGuests] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.userId) return;
        dispatch(fetchEvents(userData.userId));
        Promise.all([
            getUserTasks(userData.userId).catch(() => []),
            getUserGuests(userData.userId).catch(() => []),
            getUserExpenses(userData.userId).catch(() => []),
        ]).then(([t, g, e]) => {
            setTasks(t);
            setGuests(g);
            setExpenses(e);
            setLoading(false);
        });
    }, [dispatch, userData]);

    if (loading) return <Loading text="Loading insights..." />;

    // ── Derived stats ────────────────────────────────────────────────────
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.completed).length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const attendingGuests = guests.filter(g => g.rsvpStatus === 'Attending').length;
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    // Events by type
    const byType = events.reduce((acc, ev) => {
        acc[ev.type || 'Other'] = (acc[ev.type || 'Other'] || 0) + 1;
        return acc;
    }, {});
    const typeData = Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({ label, value }));

    // Task completion per event
    const tasksByEvent = tasks.reduce((acc, t) => {
        const ev = events.find(e => e.id === t.eventId);
        if (!ev) return acc;
        if (!acc[ev.id]) acc[ev.id] = { name: ev.name, total: 0, done: 0 };
        acc[ev.id].total++;
        if (t.status === 'completed' || t.completed) acc[ev.id].done++;
        return acc;
    }, {});
    const taskEventData = Object.values(tasksByEvent)
        .filter(d => d.total > 0)
        .map(d => ({ label: d.name, value: d.total > 0 ? Math.round((d.done / d.total) * 100) : 0, displayValue: `${d.done}/${d.total}` }));

    // RSVP breakdown
    const rsvpBreakdown = ['Attending', 'Pending', 'Not Attending'].map(status => ({
        label: status,
        value: guests.filter(g => g.rsvpStatus === status).length,
    })).filter(d => d.value > 0);

    // Expenses by category (top 6)
    const byCat = expenses.reduce((acc, e) => {
        const cat = e.category || 'Other';
        acc[cat] = (acc[cat] || 0) + (e.amount || 0);
        return acc;
    }, {});
    const catData = Object.entries(byCat)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, value]) => ({ label, value, displayValue: `$${value.toFixed(2)}` }));

    // Over-budget events (compare event budgetLimit to expenses totalSpent by eventId)
    const expensesByEvent = expenses.reduce((acc, e) => {
        acc[e.eventId] = (acc[e.eventId] || 0) + (e.amount || 0);
        return acc;
    }, {});
    const overBudgetEvents = events.filter(ev =>
        ev.budgetLimit && expensesByEvent[ev.id] > parseFloat(ev.budgetLimit)
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="secondary" size="small" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                    <FiArrowLeft size={16} /> Dashboard
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Event Insights</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Statistics and performance overview</p>
                </div>
            </div>

            {/* Over-budget warning */}
            {overBudgetEvents.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-3">
                    <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-semibold text-red-700 dark:text-red-300">⚠️ Budget Exceeded on {overBudgetEvents.length} event{overBudgetEvents.length > 1 ? 's' : ''}</p>
                        <ul className="mt-1 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                            {overBudgetEvents.map(ev => (
                                <li key={ev.id}>
                                    {ev.name} — spent ${(expensesByEvent[ev.id] || 0).toFixed(2)} of ${ev.budgetLimit} budget
                                    <button onClick={() => navigate(`/events/${ev.id}`)} className="ml-2 underline text-red-700 dark:text-red-300 text-xs">View</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Events" value={totalEvents} sub={`${activeEvents} active`} icon={FiCalendar} color="#6366f1" />
                <StatCard label="Task Completion" value={`${taskCompletionRate}%`} sub={`${completedTasks}/${tasks.length} tasks`} icon={FiCheckSquare} color="#10b981" />
                <StatCard label="Guests Attending" value={attendingGuests} sub={`of ${guests.length} total`} icon={FiUsers} color="#0ea5e9" />
                <StatCard label="Total Expenses" value={`$${totalExpenses.toFixed(0)}`} sub="across all events" icon={FiDollarSign} color="#f97316" />
            </div>

            {/* Charts row 1 */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Events by Type */}
                <Card>
                    <div className="flex items-center gap-2 mb-5">
                        <FiCalendar className="text-indigo-500" size={18} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events by Type</h2>
                    </div>
                    {typeData.length > 0 ? (
                        <BarChart data={typeData} maxValue={Math.max(...typeData.map(d => d.value))} />
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-8">No events yet</p>
                    )}
                </Card>

                {/* Guest RSVP Breakdown */}
                <Card>
                    <div className="flex items-center gap-2 mb-5">
                        <FiUsers className="text-blue-500" size={18} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Guest RSVP Breakdown</h2>
                    </div>
                    {rsvpBreakdown.length > 0 ? (
                        <BarChart
                            data={rsvpBreakdown}
                            maxValue={guests.length}
                            colorFn={i => ['#10b981', '#f59e0b', '#ef4444'][i]}
                        />
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-8">No guests yet</p>
                    )}
                </Card>
            </div>

            {/* Charts row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Task completion per event */}
                <Card>
                    <div className="flex items-center gap-2 mb-5">
                        <FiCheckSquare className="text-emerald-500" size={18} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Task Completion per Event</h2>
                        <span className="ml-auto text-xs text-gray-400">done/total</span>
                    </div>
                    {taskEventData.length > 0 ? (
                        <BarChart data={taskEventData} maxValue={100} colorFn={() => '#10b981'} />
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-8">No tasks yet</p>
                    )}
                </Card>

                {/* Spending by category */}
                <Card>
                    <div className="flex items-center gap-2 mb-5">
                        <FiDollarSign className="text-orange-500" size={18} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spending by Category</h2>
                        <span className="ml-auto text-xs text-gray-400">top 6</span>
                    </div>
                    {catData.length > 0 ? (
                        <BarChart data={catData} maxValue={Math.max(...catData.map(d => d.value))} />
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-8">No expenses yet</p>
                    )}
                </Card>
            </div>

            {/* Upcoming Events Timeline */}
            <Card>
                <div className="flex items-center gap-2 mb-5">
                    <FiTrendingUp className="text-violet-500" size={18} />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Events Timeline</h2>
                </div>
                {events.filter(e => e.status === 'active').length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No active events</p>
                ) : (
                    <div className="space-y-3">
                        {events
                            .filter(e => e.status === 'active')
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((ev, i) => {
                                const eventDate = new Date(`${ev.date}T${ev.time || '00:00'}`);
                                const diffDays = Math.round((eventDate - new Date()) / (1000 * 60 * 60 * 24));
                                const spent = expensesByEvent[ev.id] || 0;
                                const overBudget = ev.budgetLimit && spent > parseFloat(ev.budgetLimit);
                                return (
                                    <div key={ev.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/events/${ev.id}`)}>
                                        <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{ev.name}</p>
                                            <p className="text-xs text-gray-500">{eventDate.toLocaleDateString()} · {ev.type}</p>
                                            <CountdownTimer date={ev.date} time={ev.time} variant="compact" />
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-sm font-semibold ${diffDays <= 1 ? 'text-red-500' : diffDays <= 7 ? 'text-amber-500' : 'text-gray-500'}`}>
                                                {diffDays < 0 ? 'Past' : diffDays === 0 ? 'Today!' : `${diffDays}d`}
                                            </p>
                                            {overBudget && <span className="text-[10px] text-red-500 font-semibold">OVER BUDGET</span>}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Insights;
