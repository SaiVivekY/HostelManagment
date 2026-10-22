# Hostel Management System — Web App

A simple web version of the Java Swing Hostel Management System. It uses HTML, CSS, and browser JavaScript for the interface, Node.js/Express for the server, and MongoDB for storage. The original Java project is not changed.

## Included workflows

- Student registration and Admin approval or rejection.
- Admin management of hostels, blocks, floors, room types, rooms, beds, and room/bed status.
- Room availability and bed allocation; student room, bed, and roommate view.
- Payment-reference submission by students and Admin review. This is not a payment gateway.
- Weekly menu publishing, shared meal timings, student feedback, meal attendance, and Admin summaries.
- Student maintenance complaints and leave requests, Admin status review and notes, and account notifications.
- Role-based screens, protected server routes, and password hashing.

## Run locally

You need Node.js 20 or newer and a MongoDB database. MongoDB can run locally or be hosted by a provider such as MongoDB Atlas.

1. Open a terminal in this project folder.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env`. Set `MONGODB_URI`, replace `JWT_SECRET` with a long random value, and set a private `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the first Admin account. Do not commit `.env`.
4. Start the app:

   ```sh
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000). Students can register; the Admin account is created on the first server start.

The first Admin can set up hostel inventory, approve a student application, and allocate an available bed. Database collections are created as records are added. Meal-time defaults are created on startup.

## Git setup

This project ignores `.env` and `node_modules`. From the project folder, initialize Git and publish the repository to a private or public remote you control:

```sh
git init
git add .
git commit -m "Create hostel management web app"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Review staged files before committing. Keep real student data, local database exports, `.env`, and credentials out of the repository.

## Deployment preparation

Deploy this as one Node.js web service because Express serves both the API and frontend. Choose a host that supports Node.js applications and environment variables, and use a hosted MongoDB database reachable from that service.

Configure these environment variables in the host dashboard:

- `MONGODB_URI` — production MongoDB connection string.
- `JWT_SECRET` — a unique random secret of at least 24 characters.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — initial Admin credentials; change them to private values before deployment.
- `PORT` — usually provided by the host automatically.

Use `npm start` as the start command. After deployment, register a student, approve the account, create a room with beds, allocate a bed, and confirm the student-facing pages work. Set database network access to the deployed service as required by your MongoDB provider. Add a custom domain and HTTPS through the host when ready.

## Data model

MongoDB collections represent users, student profiles, hostel hierarchy, room types, rooms with embedded beds, allocations, payments, leave requests, complaints, weekly menu items, meal schedules, food feedback, attendance, and notifications. Separate documents are used for workflows that are independently reviewed or summarized; rooms contain their bed records because those are managed together.

## Current limitations

- Payment records store a reference ID and optional proof link. No gateway or file upload is implemented.
- This initial version does not import existing MySQL records. Data migration needs a reviewed export and field mapping before importing real data.
- Live deployment is not performed from this project folder: it requires the owner's hosting account, production database, and secrets.
- The source SQL defines leave requests and notifications without equivalent prominent README feature descriptions; these are included here because they are present in the schema.
