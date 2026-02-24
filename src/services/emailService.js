// Email service — opens the user's email client with all guest emails pre-filled
// For true server-side email, a Firebase Cloud Function would be required.

/**
 * Generate a mailto link that opens the user's default email client
 * with all guest emails as BCC recipients.
 */
export const emailAllGuests = (guests, eventName = 'Your Event') => {
    if (!guests || guests.length === 0) return;

    const emails = guests
        .map(g => g.email)
        .filter(Boolean);

    if (emails.length === 0) return;

    const subject = encodeURIComponent(`Invitation: ${eventName}`);
    const body = encodeURIComponent(
        `Hello,\n\nYou are invited to "${eventName}".\n\nPlease let us know if you can attend.\n\nBest regards`
    );

    // Use BCC so guests don't see each other's emails
    const mailtoLink = `mailto:?bcc=${emails.join(',')}&subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_self');
};
