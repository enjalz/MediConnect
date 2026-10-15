# MediConnect – Book a Doctor App

MediConnect is a full-stack healthcare booking platform built with the **MERN stack** (MongoDB, Express.js, React, Node.js). Patients can find doctors, book appointments and upload medical documents; doctors manage their appointments and add visit summaries; administrators verify doctors and monitor the platform.

> Developed by **Angel Fransisca Wijaya** (Individual project).

---

## Features

**Patient**
- Register and log in securely (JWT + bcrypt)
- Search doctors by name or location and filter by specialization
- Book appointments with date/time and document upload
- Reschedule or cancel appointments
- View visit summaries and prescriptions
- Apply to become a doctor
- In-app notifications and automatic appointment reminders

**Doctor**
- View all appointment requests
- Approve or reject appointments
- Download patient documents
- Add a visit summary and prescription (marks the appointment as completed)

**Admin**
- View all users, doctors and appointments
- Approve or reject doctor applications

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router v6, Axios, React Bootstrap, Ant Design, MDB React UI Kit, Material UI Icons |
| Backend | Node.js, Express.js, JSON Web Token, bcryptjs, Multer, node-cron, dotenv, CORS |
| Database | MongoDB Atlas with Mongoose |
| Tools | VS Code, Git & GitHub, nodemon |

---

## Project Structure

```
MediConnect/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Business logic (user, doctor, admin)
│   ├── middlewares/     # JWT authentication
│   ├── routes/          # API endpoints
│   ├── schemas/         # Mongoose models
│   ├── utils/           # Appointment reminder job
│   ├── uploads/         # Uploaded documents (not committed)
│   └── index.js         # Server entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── admin/   # Admin dashboard pages
        │   ├── common/  # Home, Login, Register, Notification
        │   └── user/    # Patient & doctor pages
        ├── images/
        └── App.js       # Routes and protected routes
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or above
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- Git

### 1. Clone the repository
```bash
git clone https://github.com/enjalz/MediConnect.git
cd MediConnect
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```
PORT=8001
MONGO_DB=mongodb+srv://<username>:<password>@<cluster-host>/mediconnect?appName=MediConnect
JWT_KEY=<your-secret-key>
```

Start the server:
```bash
npm start
```
You should see:
```
Reminder job started (every 30 minutes)
Server is running on port 8001
Connected to MongoDB
```

### 3. Set up the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm start
```
The app opens at **http://localhost:3000**.

### 4. First-time use
1. Register an **Admin** account first (doctor applications are sent to the admin).
2. Register a **User** account and apply as a doctor.
3. Log in as Admin and approve the doctor.
4. Register another User (patient) and book an appointment.

---

## Demo Video

URL Link: https://youtu.be/owuJW7ktyHw

---

## API Overview

Base URL: `http://localhost:8001/api`

| Group | Main endpoints |
| --- | --- |
| `/user` | `register`, `login`, `getuserdata`, `registerdoc`, `getalldoctorsu`, `getappointment`, `getuserappointments`, `cancelappointment`, `rescheduleappointment`, `getallnotification`, `deleteallnotification` |
| `/doctor` | `getdoctorappointments`, `handlestatus`, `visitsummary`, `getdocumentdownload`, `updateprofile` |
| `/admin` | `getallusers`, `getalldoctors`, `getapprove`, `getreject`, `getallAppointmentsAdmin` |

All endpoints except `register` and `login` require the header:
```
Authorization: Bearer <token>
```

---

## Future Enhancements
- Email and SMS reminders
- Time-slot booking based on doctor availability
- Online payment for consultation fees
- Video consultation (telemedicine)
- Doctor ratings and reviews
- Cloud deployment and file storage

---

## License
This project was created for academic purposes.