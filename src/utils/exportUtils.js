// CSV Export Utilities

// Download a CSV string as a file
export const downloadCSV = (data, filename) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Convert array of objects to CSV using explicit field → label mapping
// fields: array of key names to pull from each object
// labels: array of column header labels (same order as fields)
export const convertToCSV = (array, fields, labels) => {
    if (!array || array.length === 0) return '';

    const headerRow = (labels || fields).join(',');

    const rows = array.map(item =>
        fields.map(field => {
            const value = item[field];
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',')
    );

    return [headerRow, ...rows].join('\n');
};

export const exportEvents = (events) => {
    const fields = ['name', 'type', 'date', 'time', 'location', 'guestLimit', 'budgetLimit', 'status', 'createdAt'];
    const labels = ['Name', 'Type', 'Date', 'Time', 'Location', 'Capacity', 'Budget Limit', 'Status', 'Created At'];
    const csv = convertToCSV(events, fields, labels);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `events_${timestamp}.csv`);
};

export const exportGuests = (guests) => {
    // Build friendly rows with combined name
    const rows = guests.map(g => ({
        fullName: `${g.firstName || ''} ${g.lastName || ''}`.trim(),
        email: g.email || '',
        rsvpStatus: g.rsvpStatus || 'Pending',
        eventId: g.eventId || '',
    }));
    const fields = ['fullName', 'email', 'rsvpStatus', 'eventId'];
    const labels = ['Full Name', 'Email', 'RSVP Status', 'Event ID'];
    const csv = convertToCSV(rows, fields, labels);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `guests_${timestamp}.csv`);
};

export const exportTasks = (tasks) => {
    const fields = ['title', 'dueDate', 'status', 'priority', 'taskBudget', 'eventId'];
    const labels = ['Title', 'Due Date', 'Completed', 'Priority', 'Task Budget ($)', 'Event ID'];
    // Normalize status boolean to readable value
    const rows = tasks.map(t => ({
        ...t,
        status: t.status ? 'Yes' : 'No',
        taskBudget: t.taskBudget || 0,
    }));
    const csv = convertToCSV(rows, fields, labels);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `tasks_${timestamp}.csv`);
};

export const exportExpenses = (expenses) => {
    const fields = ['category', 'amount', 'paidStatus', 'eventId'];
    const labels = ['Category', 'Amount ($)', 'Paid', 'Event ID'];
    const rows = expenses.map(e => ({
        ...e,
        paidStatus: e.paidStatus ? 'Yes' : 'No',
    }));
    const csv = convertToCSV(rows, fields, labels);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `expenses_${timestamp}.csv`);
};
