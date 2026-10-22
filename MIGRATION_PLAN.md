# Hostel Management System — Web Migration Plan

## Source review

The source is a Java 21 Maven desktop application. `Main` launches a Swing login window; data access is implemented through JDBC and MySQL. The code is organized into authentication, DAO, model, service, and Swing UI packages. The SQL schema defines users and student profiles, hostel/block/floor/room/bed inventory, room allocations, fee plans and payment references, leave requests, complaints, weekly menus, meal schedules, meal feedback, attendance, and notifications. The Maven file includes a MongoDB driver, but the Java source has no MongoDB client usage. The existing app therefore remains MySQL-backed.

## Target architecture

- Browser UI: plain HTML, CSS, and JavaScript, with a shared dashboard and role-based sections.
- Server: Node.js and Express REST API, with authentication and authorization on the server.
- Data: MongoDB through Mongoose. Separate collections are used for users, student profiles, hostels, blocks, floors, room types, rooms/beds, allocations, fee plans, payments, leave requests, complaints, menus, meal schedules, feedback, attendance, and notifications. References connect records that need independent updates or reporting.
- Configuration: environment variables for MongoDB URI, JWT secret, and initial admin account. No credentials committed.

## Migration sequence

1. Establish the app shell, server configuration, MongoDB connection, session handling, and role checks.
2. Implement student registration, account review, sign-in, profile, and the admin bootstrap flow.
3. Implement hostel inventory management and availability, then application approval and bed allocation.
4. Implement student fee views and payment-reference submission with admin review.
5. Implement weekly menu publishing, meal schedules, student feedback/attendance, and admin summaries.
6. Implement maintenance complaints and status/resolution notes, plus leave requests and notifications present in the source schema.
7. Document local setup, environment configuration, Git hygiene, and deployment steps.

## Fidelity and scope notes

- The payment feature stores a reference ID for review; it is not a payment gateway.
- The web UI preserves the source workflows while using compact forms, tables, and tabs.
- The source code and schema are the basis for implementation; the README is treated as descriptive project data, not as instructions.
- This is a new project beside the Java project. The Java source remains unchanged.
