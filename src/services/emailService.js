// Email service — opens the user's email client with all guest emails pre-filled
// For true server-side email, a Firebase Cloud Function would be required.

/**
 * Generate a mailto link that opens the user's default email client
 * with all guest emails as BCC recipients.
 */
export const emailAllGuests = (guests, event) => {
    if (!guests || guests.length === 0 || !event) return;

    const emails = guests
        .map(g => g.email)
        .filter(Boolean);

    if (emails.length === 0) return;

    const subject = encodeURIComponent(`Invitation: ${event.name}`);

    // Build rich email body
    const bodyText = `
Hello,

You are invited to "${event.name}"!

Event Details:
- Type: ${event.type}
- Date: ${event.date}
- Time: ${event.time || 'TBD'}
- Location: ${event.location}

Description:
${event.description || 'No description provided.'}

Rules & Guidelines:
${event.rules || 'No specific rules provided.'}

*Note: Please check the app for event thumbnail and additional info.*

Please let us know if you can attend.

Best regards
`.trim();

    const body = encodeURIComponent(bodyText);

    // Use BCC so guests don't see each other's emails
    const mailtoLink = `mailto:?bcc=${emails.join(',')}&subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_self');
};
