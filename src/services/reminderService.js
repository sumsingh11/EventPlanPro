/**
 * reminderService.js
 * Checks tasks and events for upcoming deadlines and returns reminder messages.
 * Used by Dashboard on mount for in-app notification banners.
 */

const TASK_REMINDER_HOURS = 48;  // Warn if task due within 48h
const EVENT_REMINDER_DAYS_NEAR = 7;  // Warn if event within 7 days
const EVENT_REMINDER_DAYS_URGENT = 1; // Urgent if within 24h

/**
 * Returns tasks that are due within TASK_REMINDER_HOURS hours and not completed.
 * @param {Array} tasks - Array of task objects with dueDate field
 * @returns {Array} of { task, hoursLeft, label, urgent }
 */
export const checkTaskReminders = (tasks = []) => {
    const now = new Date();
    const reminders = [];

    tasks.forEach(task => {
        if (!task.dueDate || task.status === 'completed' || task.completed) return;
        const due = new Date(task.dueDate);
        const diffMs = due - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs < 0) {
            // Overdue
            reminders.push({
                id: `task-${task.id}`,
                type: 'task',
                urgent: true,
                message: `⏰ Task overdue: "${task.title}" was due on ${due.toLocaleDateString()}`,
            });
        } else if (diffHours <= TASK_REMINDER_HOURS) {
            reminders.push({
                id: `task-${task.id}`,
                type: 'task',
                urgent: diffHours <= 12,
                message: `📋 Reminder: Task "${task.title}" is due in ${Math.round(diffHours)}h`,
            });
        }
    });

    return reminders;
};

/**
 * Returns events that are happening soon.
 * @param {Array} events - Array of event objects with date field
 * @returns {Array} of reminder objects
 */
export const checkEventReminders = (events = []) => {
    const now = new Date();
    const reminders = [];

    events.forEach(event => {
        if (!event.date || event.status !== 'active') return;
        const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
        const diffMs = eventDate - now;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffMs < 0) return; // past events

        if (diffDays <= EVENT_REMINDER_DAYS_URGENT) {
            reminders.push({
                id: `event-urgent-${event.id}`,
                type: 'event',
                urgent: true,
                message: `🚨 Your event "${event.name}" is happening TODAY or TOMORROW! Make sure everything is ready.`,
            });
        } else if (diffDays <= EVENT_REMINDER_DAYS_NEAR) {
            reminders.push({
                id: `event-near-${event.id}`,
                type: 'event',
                urgent: false,
                message: `📅 Heads up: "${event.name}" is in ${Math.round(diffDays)} days on ${eventDate.toLocaleDateString()}.`,
            });
        }
    });

    return reminders;
};
