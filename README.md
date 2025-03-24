# Doctor Appointment Booking System

A comprehensive healthcare appointment management solution built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). This system streamlines the process of scheduling and managing medical appointments between patients, doctors, and administrators.

## 🌟 Features

### User Roles
- **Patients** can:
  - Create and manage accounts
  - Search for doctors by specialty
  - Book, reschedule, and cancel appointments
  - View appointment history
  - Receive notifications
  
- **Doctors** can:
  - Manage their profile and availability
  - View and manage appointments
  - Accept or reject appointment requests
  - Update patient medical information
  
- **Administrators** can:
  - Approve doctor applications
  - Manage all users (doctors and patients)
  - Block/unblock users
  - Send notifications
  - View system statistics

### Key Technical Features
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Real-time Notifications**: Instant updates for appointment changes
- **Optimized API Calls**: Throttled API requests to improve application performance
- **Responsive Design**: Mobile-friendly interface using Ant Design components
- **Form Validation**: Comprehensive client and server-side validation

## 🛠️ Technology Stack

### Frontend
- **React.js**: UI components and state management
- **Redux**: Global state management
- **Ant Design**: UI framework for a modern, responsive interface
- **Axios**: API request handling with interceptors
- **Moment.js**: Date and time formatting

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: MongoDB object modeling
- **JSON Web Tokens**: Secure authentication
- **Bcrypt.js**: Password hashing

## 🚀 Recent Optimizations

- Fixed issues with the appointment booking flow
- Enhanced doctor availability detection with multiple timing formats
- Optimized API calls to reduce server load
- Added timestamp-based throttling to prevent excessive data fetching
- Improved state management and synchronization between components
- Fixed deprecation warnings in Ant Design components
- Enhanced error handling and validation on both frontend and backend

## 📋 Prerequisites

- Node.js (v14 or newer)
- MongoDB (local or Atlas connection)
- NPM or Yarn package manager

## 💻 Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VSHAGEETHPRATHEEP06/Doctor-Appointment-Booking-System.git
   cd Doctor-Appointment-Booking-System
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=8000
     NODE_ENV=development
     MONGO_URL=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```

4. **Run the application**
   ```bash
   # Run both client and server with concurrently
   npm run dev
   
   # Or run separately
   # Server only (http://localhost:8000)
   npm run server
   
   # Client only (http://localhost:3000)
   npm run client
   ```

5. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

## 📱 Application Usage

1. **Patient Flow**
   - Register/Login
   - Search for doctors by specialty
   - View doctor profiles and availability
   - Book an appointment selecting date and time
   - Manage or cancel appointments

2. **Doctor Flow**
   - Apply for a doctor account (requires admin approval)
   - Update profile and availability
   - View and manage appointments
   - Accept/reject appointment requests

3. **Admin Flow**
   - Approve doctor applications
   - Manage all users in the system
   - Generate system reports

## 🙏 Acknowledgements

- [Ant Design](https://ant.design/) for the UI components
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Express.js](https://expressjs.com/) for the server framework
- [React.js](https://reactjs.org/) for the frontend library

---

Developed by Shageethpratheep
