# Multi-Tenant Organization Workspace API

A RESTful API for managing multi-tenant workspace system with strict data isolation across organizations. Built with Node.js, TypeScript, Express.js, and PostgreSQL.

## 🎯 Project Overview

This API enables multiple organizations to work independently with their own users, projects, and tasks while ensuring complete data isolation. The system supports three role types with different access levels:

- **Platform Admin**: Can create and manage all organizations
- **Organization Admin**: Can manage users, projects, and tasks within their organization
- **Organization Member**: Can view assigned tasks and their organization's projects

## 🗄️ Database Choice: PostgreSQL

**Why PostgreSQL?**

This project requires structured data with clear relationships (users belong to organizations, projects to organizations, tasks to projects, and task assignments to users). PostgreSQL excels at:

- **Relational Integrity**: Foreign keys enforce relationships and prevent cross-organization access violations
- **ACID Transactions**: Ensures data consistency during user creation, task assignments, and other multi-step operations
- **Complex Queries**: Efficiently handles authorization checks (e.g., filtering tasks by user assignment and organization)
- **Schema Constraints**: Built-in constraints align with the assignment's emphasis on "database integrity" and strict rules (e.g., no cross-org access)

While MongoDB could work for flexible schemas, the relational nature of our data models and the need for strict isolation make PostgreSQL the optimal choice.

**ORM**: Prisma (for type-safe queries and easy migrations)

## 🏗️ Data Models & Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
├─────────────────┤
│ id (PK)         │
│ name (unique)   │
│ description     │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴─────────────────────────┐
    │                              │
┌───▼──────────┐            ┌──────▼─────┐
│    User      │            │  Project   │
├──────────────┤            ├────────────┤
│ id (PK)      │            │ id (PK)    │
│ email        │            │ name       │
│ password     │            │ description│
│ name         │            │ orgId (FK) │
│ role         │            │ createdAt  │
│ orgId (FK)   │            │ updatedAt  │
│ createdAt    │            └──────┬─────┘
│ updatedAt    │                   │
└──────┬───────┘                   │ 1:N
       │                           │
       │                      ┌────▼────────┐
       │                      │    Task     │
       │                      ├─────────────┤
       │                      │ id (PK)     │
       │                      │ title       │
       │                      │ description │
       │                      │ status      │
       │                      │ projectId   │
       │                      │ createdAt   │
       │                      │ updatedAt   │
       │                      └──────┬──────┘
       │                             │
       │         M:N                 │
       └────────────────┬────────────┘
                        │
               ┌────────▼────────────┐
               │  TaskAssignment     │
               ├─────────────────────┤
               │ id (PK)             │
               │ taskId (FK)         │
               │ userId (FK)         │
               │ assignedAt          │
               └─────────────────────┘
```

### Tables

1. **organizations**: Stores organizations created by Platform Admins
2. **users**: Stores users with roles and organization affiliation
3. **projects**: Projects belonging to organizations
4. **tasks**: Tasks belonging to projects
5. **task_assignments**: Junction table for many-to-many user-task assignments

## 📁 Folder Structure

```
backend/
├── prisma/
│   └── schema/
│       ├── schema.prisma       # Main Prisma config
│       ├── enum.prisma         # Enums (UserRole, TaskStatus, etc.)
│       ├── organization.prisma # Organization model
│       ├── user.prisma         # User model
│       ├── project.prisma      # Project model
│       └── task.prisma         # Task & TaskAssignment models
├── src/
│   ├── app/
│   │   ├── errors/
│   │   │   └── ApiError.ts     # Custom error class
│   │   ├── helper/
│   │   │   ├── jwtHelper.ts    # JWT sign/verify utilities
│   │   │   ├── paginationHelper.ts
│   │   │   └── pick.ts         # Query parameter picker
│   │   ├── middlewares/
│   │   │   ├── auth.ts         # JWT & role-based auth middleware
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts # Zod validation middleware
│   │   ├── modules/
│   │   │   ├── auth/           # Authentication (login, getMe)
│   │   │   ├── organization/   # Organization CRUD (Platform Admin)
│   │   │   ├── user/           # User CRUD (Org-scoped)
│   │   │   ├── project/        # Project CRUD (Org-scoped)
│   │   │   └── task/           # Task CRUD + assignments
│   │   ├── routes/
│   │   │   └── index.ts        # Main router
│   │   ├── shared/
│   │   │   ├── catchAsync.ts   # Async error wrapper
│   │   │   ├── prisma.ts       # Prisma client instance
│   │   │   └── sendResponse.ts # Standardized response
│   │   └── types/
│   │       └── common.ts       # JWT payload & common types
│   ├── config/
│   │   └── index.ts            # Environment variables
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── .env.example                # Example env file
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Authorization Enforcement

Authorization is enforced at **multiple layers** to ensure strict isolation:

### 1. JWT Payload
Every authenticated request includes:
```typescript
{
  userId: string,
  email: string,
  role: UserRole,
  organizationId: string | null
}
```

### 2. Middleware Layer
`auth.ts` middleware:
- Verifies JWT token from cookies
- Checks if user has required role(s)
- Injects `req.user` with decoded payload

### 3. Service Layer
Business logic enforces org-scoping:
- **Non-Platform users**: All queries filter by `organizationId = req.user.organizationId`
- **Members**: Additional filter for assigned tasks only
- **Platform Admin**: Can access all organizations

Example:
```typescript
// Org Admin listing users
const users = await prisma.user.findMany({
  where: {
    organizationId: req.user.organizationId // Enforced in service
  }
});
```

### 4. Cross-Organization Access Prevention
- Every `getById`, `update`, `delete` operation verifies resource belongs to user's org
- Task assignments only allowed within same organization
- Foreign key constraints prevent orphaned records

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (returns JWT in cookies)
- `GET /api/v1/auth/me` - Get current user profile

### Organizations (Platform Admin only)
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations` - List all organizations (pagination/search/filter)
- `GET /api/v1/organizations/:id` - Get organization by ID
- `PATCH /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization

### Users (Org-scoped)
- `POST /api/v1/users` - Create user (Org Admin/Platform Admin)
- `GET /api/v1/users` - List users (org-scoped, pagination/search/filter)
- `GET /api/v1/users/me` - Get own profile
- `GET /api/v1/users/:id` - Get user by ID (org-scoped)
- `PATCH /api/v1/users/:id` - Update user (org-scoped)
- `DELETE /api/v1/users/:id` - Delete user (org-scoped)

### Projects (Org-scoped)
- `POST /api/v1/projects` - Create project (Org Admin/Platform Admin)
- `GET /api/v1/projects` - List projects (org-scoped, pagination/search/filter)
- `GET /api/v1/projects/:id` - Get project by ID (org-scoped)
- `PATCH /api/v1/projects/:id` - Update project (Org Admin/Platform Admin)
- `DELETE /api/v1/projects/:id` - Delete project (Org Admin/Platform Admin)

### Tasks (Org-scoped + Assignment filtering)
- `POST /api/v1/tasks` - Create task (Org Admin/Platform Admin)
- `GET /api/v1/tasks` - List tasks (Org Admin: all in org, Member: only assigned)
- `GET /api/v1/tasks/:id` - Get task by ID (access control)
- `PATCH /api/v1/tasks/:id` - Update task (Org Admin/Platform Admin)
- `DELETE /api/v1/tasks/:id` - Delete task (Org Admin/Platform Admin)
- `POST /api/v1/tasks/:id/assign` - Assign task to user (Org Admin/Platform Admin)
- `DELETE /api/v1/tasks/:id/assign/:userId` - Unassign task

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm/yarn/bun

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multi_tenant_workspace"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=90d
```

4. **Generate Prisma Client**
```bash
npm run prisma:generate
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed database (optional - for test data)**
```bash
npm run prisma:seed
```

7. **Start development server**
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 🧪 Test Credentials (After Seeding)

### Platform Admin
- Email: `platform@admin.com`
- Password: `Pass123!`

### Organization 1
- **Org Admin**
  - Email: `admin@org1.com`
  - Password: `Pass123!`
- **Member**
  - Email: `member@org1.com`
  - Password: `Pass123!`

### Organization 2
- **Org Admin**
  - Email: `admin@org2.com`
  - Password: `Pass123!`

## 📮 Postman Collection

Import the Postman collection (`postman_collection.json`) to test all endpoints:

1. Import collection into Postman
2. Login using test credentials (Platform Admin or Org Admin)
3. Access token is automatically set in cookies
4. Test endpoints according to role permissions

**Important**: The collection uses cookie-based authentication. Make sure "Automatically follow redirects" and "Send cookies with requests" are enabled in Postman settings.

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
```

## 🚢 Deployment

### Database Hosting (Free Options)
- **Supabase**: Free PostgreSQL with 500MB storage
- **Neon**: Serverless PostgreSQL with 512MB storage
- **Railway**: PostgreSQL with $5 free credit/month

### Backend Hosting (Free Options)
- **Render**: Free tier with 750 hours/month
- **Railway**: $5 free credit/month
- **Vercel**: Serverless functions (may need adapter)

### Deployment Steps

1. **Setup Database**
   - Create PostgreSQL database on Supabase/Neon/Railway
   - Copy connection string

2. **Deploy Backend**
   - Push code to GitHub
   - Connect to Render/Railway
   - Set environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `REFRESH_TOKEN_SECRET`
     - `NODE_ENV=production`
   - Deploy

3. **Run Migrations**
```bash
npm run prisma:migrate deploy
```

4. **Seed Database** (optional)
```bash
npm run prisma:seed
```

## 🏆 Key Features

✅ **Multi-Tenant Architecture** with strict data isolation  
✅ **Role-Based Access Control** (Platform Admin, Org Admin, Member)  
✅ **JWT Authentication** with secure cookie storage  
✅ **Organization-Scoped Operations** enforced at service layer  
✅ **Task Assignment System** with member-only visibility  
✅ **Pagination, Search, Filter, Sort** on all list endpoints  
✅ **Comprehensive Validation** using Zod  
✅ **Global Error Handling** with Prisma error mapping  
✅ **Type-Safe Database Access** with Prisma ORM  
✅ **Clean Architecture** with modular folder structure  

## 📝 Business Rules Enforced

- Users cannot access another organization's data
- Tasks cannot be assigned across organizations
- Members can only see tasks assigned to them
- Organization Admins cannot create Platform Admins
- Authorization logic lives in service layer (not just routes)
- Foreign key constraints maintain database integrity

## 🧩 Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs
- **HTTP Status**: http-status

## 📄 License

MIT

## 👨‍💻 Author

Hamza Aryan Sapnil

---

**Note**: This is a technical assignment project demonstrating backend fundamentals, database understanding, authorization logic, and real-world readiness.
