<<<<<<< HEAD
# EventPlanPro

A comprehensive event management web application built with React, Firebase, Redux Toolkit, and Tailwind CSS.

## Features

- 🎉 **Event Management**: Create, edit, delete, and duplicate events
- 👥 **Guest Management**: Track RSVPs, manage attendees, prevent duplicate emails
- ✅ **Task Management**: Create tasks, track completion, visual progress indicators
- 💰 **Budget Management**: Set budgets, track expenses, auto-calculate totals
- 🌙 **Dark Mode**: System-wide dark mode with persistence
- 📊 **Admin Dashboard**: System-wide analytics and user management
- 📤 **CSV Export**: Export all data as CSV files
- 🔐 **Secure Authentication**: Firebase Authentication with role-based access
- 📱 **Responsive Design**: Mobile, tablet, and desktop support

## Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase account

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:5173`

## Tech Stack

- **Frontend**: React 18, Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Routing**: React Router v6
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Charts**: Chart.js

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Route pages
├── services/        # Firebase service layer
├── store/           # Redux store & slices
├── utils/           # Utility functions
└── config/          # Firebase configuration
```

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database

### 2. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Create Admin User (Optional)
After creating a user through the app, manually set `role: 'admin'` in the Firestore `users` collection.


## Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Educational/Portfolio Project

---

=======
# EventPlanPro
>>>>>>> 9dd5f15fa8208f5c5f038ef8fbc17489ec0fd814
