# Appointcut-web

## Project Overview

**Appointcut-web** is a Node.js and Express-based web application that serves as a comprehensive barbershop appointment and management system. It provides distinct functionalities and portals for different user roles: Admins, Barbershop Owners, Desk Employees, Barbers, and Customers. The application handles shop approvals, appointment scheduling, real-time notifications, file uploads (such as business permits), and sales/salary report generation.

### Tech Stack
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL (using `mysql` and `mysql2` packages)
*   **Templating Engine:** Handlebars (`express-handlebars`)
*   **Real-time Communication:** Socket.io
*   **Utilities:** Multer (file uploads), PDFKit (report generation), Moment.js (date manipulation)

## Architecture & Directory Structure

*   **`app.js`**: The main entry point. It sets up the Express application, configures Handlebars, serves static directories, initializes WebSockets (Socket.io) for real-time notifications, and mounts all application routes.
*   **`server/routes/`**: Contains modularized route handlers acting as controllers for different features (e.g., `routesLogin.js`, `routesOwners.js`, `routesCustomers.js`, `routesBarbershopApplications.js`).
*   **`views/`**: Contains Handlebars (`.hbs`) templates used for server-side UI rendering, including layouts and partials.
*   **`classes/`**: Houses object models, repository classes, and managers (e.g., `AppointmentsManager.js`, `HairstyleRepository.js`) representing an ongoing transition towards a structured repository pattern.
*   **`AppointCutUtils.js`**: A central utility module that provides database connection pooling and raw SQL query wrapper functions (e.g., `getAllFrom`, `getOneFromWhere`, `updateSet`) heavily utilized across the routing layer. Also handles PDF report generation.
*   **`public/` & `permits/`**: Static directories for web assets (CSS, JS, images) and uploaded files (like BIR and Business Permits).
*   **Database Scripts (`*.sql`)**:
    *   `init.sql`: Defines the base physical tables (usually prefixed with `tbl`).
    *   `init_views.sql`: Crucial mapping layer that creates views to normalize table names (removing `tbl` prefix) and align column casing (e.g., mapping `contact` to `Contact`) as expected by Handlebars templates and backend logic.
    *   `seed.sql`: Populates the database with default lookup values and test data.

## Building and Running

### Prerequisites
*   **Node.js** (v14+ recommended)
*   **MySQL Server**

### Setup Instructions

1.  **Database Initialization:**
    *   Create a MySQL database and run the initialization scripts in the following order:
        1.  `init.sql`
        2.  `init_views.sql`
        3.  `seed.sql`
2.  **Environment Variables:**
    *   Ensure a `.env` file is present in the root directory with the appropriate database credentials (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`). Note: Some files may fallback to hardcoded default credentials (e.g., `admin`/`admin`).
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Run the Application:**
    *   For development (auto-restarts on changes):
        ```bash
        npm start
        ```
    *   For production:
        ```bash
        node app.js
        ```
5.  **Access:**
    *   Open your browser and navigate to `http://localhost:3000` (or the port defined in your `.env`).

## Development Conventions

*   **Database Interactions:** Most database interactions are handled via raw SQL queries executed through helper functions in `AppointCutUtils.js`. When adding new queries, be mindful of SQL injection risks and prefer parameterized queries where possible.
*   **Database Views vs. Tables:** The application's backend and views rely heavily on specific casing (e.g., `FullName`, `Contact`). Because the physical tables in `init.sql` may not match this casing or include joined data, always query the views defined in `init_views.sql` rather than querying `tbl*` physical tables directly for read operations.
*   **Routing:** New features should be added as new route modules within `server/routes/` and mounted in `app.js`.
*   **Views & Helpers:** Handlebars templates are used exclusively. Custom Handlebars helpers (like `withinShop`, `isBarber`) are registered in `app.js` to handle view-specific logic. Keep business logic out of the `.hbs` files whenever possible.
*   **Static Assets:** Uploaded user files (permits, images) are served directly from the filesystem (`/permits`, `/public/images`). Ensure appropriate directory permissions are set in production environments.
