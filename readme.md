# 🗂️ Task Management System – MERN Stack Project

A full-featured task management system built using the MERN stack (MongoDB, Express.js, React, Node.js), designed for teams and organizations to manage projects, tasks, subtasks, members, and notes with role-based access control.

---

## 🚀 Features

- 🔐 User Authentication with JWT (Access & Refresh tokens)
- 🧑‍💻 Role-based Access: Admin, Project Admin, and Member
- 📁 Project and Task Management
- 🧩 Subtasks under each Task
- 🗒️ Project Notes Feature
- 👥 Add/Update/Delete Members
- 🖼️ Avatar Upload with Cloudinary
- 📅 Due Dates and Status Tracking
- 🔒 Protected Routes with Middleware
- 📊 Responsive UI with React + Tailwind CSS
- 📈 Rate Limiting & Security Features added ( CORS, etc.)

---

## 📁 Folder Structure

TaskManager/
│
├── backend/ # Node.js + Express + MongoDB APIs
├── frontend/ # React + Vite Frontend
└── README.md # Project Overview File (this file)

## ⚙️ Technologies Used

- Frontend: React.js, React Router, Axios, Tailwind CSS, Toastify
- Backend: Node.js, Express.js, MongoDB, Mongoose, Express Validator
- Auth: JWT, Cookies, Refresh Token Strategy
- Image Upload: Cloudinary + Multer
- Rate Limiting: express-rate-limit
- Error Handling: Custom Global Error Handler


## Setup Backend

- cd backend
- npm install

## Setup Frontend 

- cd frontend
- npm install
- npm run dev

## Create a .env file based on .env.Sample

## Default Roles

 - ADMIN: Has access to all routes and functionalities
 - PROJECT_ADMIN: Manages project-specific members and tasks
 - MEMBER: Can only view and update their assigned tasks

 