# 🛡️ CyberTech Institute — Full-Stack LMS

Professional IT Training Institute Website + Learning Management System

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

## 📁 Project Structure

```
cybertech-lms/
├── frontend/                  # React + Vite + Tailwind
│   └── src/
│       ├── admin/             # Admin Panel
│       ├── student/           # Student Portal
│       ├── components/        # Shared UI Components
│       ├── context/           # Auth Context + API
│       ├── data/              # Sample/Static Data
│       └── pages/             # Public Pages
│
└── backend/                   # Node.js + Express + MongoDB
    ├── models/                # Mongoose Models
    ├── routes/                # API Routes
    ├── middleware/            # Auth Middleware
    └── seed.js                # Database Seeder
```

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
cp .env .env.local
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB (if local)
mongod

# Seed the database with sample data
npm run seed

# Start the server
npm run dev
```

### Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cybertech_lms
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
CLIENT_URL=http://localhost:5173
```

---

## 🌐 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## 👤 Demo Accounts

After seeding the database:

| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Admin   | admin@cybertech.com       | Admin@123    |
| Student | student@cybertech.com     | Student@123  |

---

## 🗺️ Pages & Routes

### Public
| Route             | Description            |
|-------------------|------------------------|
| `/`               | Home Page              |
| `/courses`        | Course Listing         |
| `/courses/:slug`  | Course Detail          |
| `/trainers`       | Trainer Profiles       |
| `/contact`        | Contact / Book Demo    |
| `/login`          | Login Page             |
| `/register`       | Register Page          |

### Student Portal (Auth Required)
| Route                    | Description              |
|--------------------------|--------------------------|
| `/student`               | Dashboard                |
| `/student/courses`       | My Enrolled Courses      |
| `/student/player/:id`    | Video Player             |
| `/student/materials`     | Download Materials       |
| `/student/profile`       | Profile Settings         |

### Admin Panel (Admin Only)
| Route                    | Description              |
|--------------------------|--------------------------|
| `/admin`                 | Dashboard + Analytics    |
| `/admin/courses`         | Manage Courses           |
| `/admin/users`           | Manage Students          |
| `/admin/enrollments`     | View Enrollments         |
| `/admin/payments`        | Payment History          |
| `/admin/trainers`        | Manage Trainers          |
| `/admin/materials`       | Upload Materials         |
| `/admin/settings`        | Institute Settings       |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login
GET    /api/auth/me            Get current user (JWT)
PUT    /api/auth/update-profile Update profile
PUT    /api/auth/change-password Change password
```

### Courses
```
GET    /api/courses            Get all courses (with filters)
GET    /api/courses/:id        Get course details
POST   /api/courses            Create course (Admin)
PUT    /api/courses/:id        Update course (Admin)
DELETE /api/courses/:id        Delete course (Admin)
```

### Enrollments
```
GET    /api/enrollments/my     Get my enrollments
POST   /api/enrollments        Enroll in course
PUT    /api/enrollments/:id/progress  Update progress
```

### Payments
```
POST   /api/payments/demo      Demo payment + auto enroll
POST   /api/payments/razorpay/create-order  Create Razorpay order
GET    /api/payments/my        My payment history
```

### Admin
```
GET    /api/admin/stats        Dashboard statistics
GET    /api/admin/users        All users
PUT    /api/admin/users/:id    Update user
DELETE /api/admin/users/:id    Delete user
POST   /api/admin/assign-course Assign course to user
GET    /api/admin/trainers     All trainers
POST   /api/admin/trainers     Create trainer
GET    /api/admin/enrollments  All enrollments
GET    /api/admin/payments     All payments
```

### Materials
```
GET    /api/materials/course/:id  Get course materials (enrolled)
POST   /api/materials             Upload material (Admin)
DELETE /api/materials/:id        Delete material (Admin)
```

---

## 💳 Payment Integration

### Demo Mode (Default)
- Click "Enroll Now" → instant demo payment
- Auto-enrolls student into course

### Razorpay (Production)
1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
2. In frontend `CourseDetailPage.jsx`, replace demo payment with Razorpay SDK
3. Backend `/api/payments/razorpay/create-order` creates order

### Stripe (Production)
1. Set `STRIPE_SECRET_KEY` in `.env`
2. Add Stripe routes similar to Razorpay
3. Use `@stripe/stripe-js` in frontend

---

## 🎨 Tech Stack

### Frontend
- React 18 + Vite 5
- Tailwind CSS 3
- Framer Motion (animations)
- React Router v6
- Axios + React Query
- Recharts (analytics charts)
- Lucide React (icons)
- React Hot Toast (notifications)

### Backend
- Node.js + Express 4
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Multer (file uploads)

---

## 🏗️ Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render/VPS)
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

### MongoDB Atlas
- Create cluster at mongodb.com/atlas
- Update `MONGODB_URI` with Atlas connection string

---

## 📋 Courses Included

1. Complete Cyber Security Bootcamp (₹28,000)
2. CCNA Complete Course 200-301 (₹19,999)
3. AWS Solutions Architect Associate (₹24,999)
4. VMware vSphere 8 Masterclass (₹22,000)
5. Nutanix Certified Professional (₹20,999)
6. Google Cloud Professional (₹23,499)
7. Firewall & Network Security (₹26,000)
8. CCNP Enterprise ENCOR+ENARSI (₹33,000)

---

## 🔒 Security Features

- JWT token authentication (7-day expiry)
- Password hashing with bcrypt (salt rounds: 12)
- Protected routes (student + admin)
- Role-based access control
- Token refresh on API calls
- 401 auto-logout

---

Built with ❤️ for IT professionals
