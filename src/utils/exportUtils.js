// CSV Export Utilities

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

export const convertToCSV = (array, headers) => {
    if (!array || array.length === 0) {
        return '';
    }

    // Create header row
    const headerRow = headers.join(',');

    // Create data rows
    const rows = array.map(item => {
        return headers.map(header => {
            const value = item[header];
            // Handle values that contain commas or quotes
            if (value === null || value === undefined) {
                return '';
            }
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });

    return [headerRow, ...rows].join('\n');
};

export const exportEvents = (events) => {
    const headers = ['name', 'type', 'date', 'time', 'location', 'guestLimit', 'budgetLimit', 'createdAt'];
    const csv = convertToCSV(events, headers);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `events_${timestamp}.csv`);
};

export const exportGuests = (guests) => {
    const headers = ['firstName', 'lastName', 'email', 'rsvpStatus', 'eventId', 'createdAt'];
    const csv = convertToCSV(guests, headers);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `guests_${timestamp}.csv`);
};

export const exportTasks = (tasks) => {
    const headers = ['title', 'dueDate', 'status', 'eventId', 'createdAt'];
    const csv = convertToCSV(tasks, headers);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `tasks_${timestamp}.csv`);
};

export const exportExpenses = (expenses) => {
    const headers = ['category', 'amount', 'paidStatus', 'budgetId', 'eventId', 'createdAt'];
    const csv = convertToCSV(expenses, headers);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `expenses_${timestamp}.csv`);
};
