# Event Ticketing System


This is a robust backend system for an event ticketing platform, built with Node.js, Express, and Prisma. It provides a comprehensive set of features for event management, user authentication, ticket reservation, and payment processing. The application is designed for scalability and reliability, incorporating features like Redis caching for performance and optimistic concurrency control to handle high-demand scenarios.

## Features

-   **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
-   **Role-Based Access Control**: Differentiated permissions for `CUSTOMER`, `ORGANIZER`, and `ADMIN` roles.
-   **Event Management**: Organizers can create, update, delete, and view their own events.
-   **Reservation System**: Customers can browse events and book reservations. Reservations expire after 10 minutes if not paid.
-   **Optimistic Concurrency Control**: Prevents race conditions during ticket booking by using a versioning system on event records, ensuring data integrity.
-   **Idempotent Payments**: Guarantees that payment processing can be safely retried without creating duplicate transactions.
-   **Advanced Event Search**: Users can search and filter events by name, date, category, and organizer, with support for pagination.
-   **Profile Management**: Users can update their profile information, including changing their password.
-   **Performance Caching**: Utilizes Redis to cache frequently accessed data (like event lists and reservations), significantly reducing database load and improving response times. Cache is intelligently invalidated when underlying data changes.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Caching**: Redis
-   **Authentication**: `jsonwebtoken`, `bcryptjs`
-   **Validation**: `zod`
-   **Security**: `helmet`, `cors`

## Database Schema

The application uses a PostgreSQL database managed by Prisma. The core models are:

-   **User**: Stores user credentials and role (`CUSTOMER`, `ORGANIZER`, `ADMIN`).
-   **Event**: Contains event details like name, seats, date, and category. Managed by `ORGANIZER` users. Includes a `version` field for optimistic concurrency.
-   **Reservation**: Links a `User` to an `Event` for a ticket booking. It has a status (`RESERVED`, `PAID`, `EXPIRED`) and an expiration timestamp.
-   **Payment**: Records payment attempts for a reservation. An `idempotencyKey` prevents duplicate charges.


## API Endpoints

All endpoints require authentication via a JWT Bearer token or cookie.

### Authentication (`/auth`)

| Method | Endpoint      | Description                  |
| :----- | :------------ | :--------------------------- |
| `POST` | `/register`   | Registers a new user.        |
| `POST` | `/login`      | Logs in a user.              |
| `POST` | `/logout`     | Logs out the current user.   |

### Events (`/event`)

_(Organizer authentication required for management endpoints)_

| Method   | Endpoint                          | Description                                         |
| :------- | :-------------------------------- | :-------------------------------------------------- |
| `POST`   | `/createEvent`                    | Creates a new event.                                |
| `PATCH`  | `/updateEvent/:event_id`          | Updates an existing event.                          |
| `DELETE` | `/deleteEvent/:event_id`          | Soft deletes an event (marks `isDelete` as true). |
| `GET`    | `/`                               | Views all events created by the logged-in organizer.|
| `GET`    | `/:event_id/eventReservation`     | Views all paid reservations for a specific event.   |

### Reservations & Payments (`/payment`)

_(Customer authentication required)_

| Method  | Endpoint            | Description                                |
| :------ | :------------------ | :----------------------------------------- |
| `POST`  | `/:event_id`        | Books a temporary reservation for an event.|
| `POST`  | `/`                 | Initiates a payment for a reservation.     |
| `PATCH` | `/confirmpayment`   | Confirms a successful payment.             |

### Profile (`/profile`)

| Method  | Endpoint          | Description                                    |
| :------ | :---------------- | :--------------------------------------------- |
| `PATCH` | `/changeProfile`  | Updates the current user's name or password.   |
| `GET`   | `/reservations`   | Views the current user's reservations.         |

### Search (`/searchevent`)

| Method | Endpoint | Description                                                                                             |
| :----- | :------- | :------------------------------------------------------------------------------------------------------ |
| `GET`  | `/`      | Search and filter events. Supports `page`, `limit`, `category`, `upcoming`, `organizer`, `name`, `date`. |

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   PostgreSQL
-   Redis

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Al1husse1n/Event-ticketing-system.git
    cd Event-ticketing-system
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database URL for Prisma
    DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/yourdatabase"

    # JWT secret key for signing tokens
    JWT_SECRET="your_jwt_secret_key"

    # Application Port
    PORT=5001

    # Redis connection URL
    REDIS_URL="redis://127.0.0.1:6379"

    # Client URL for CORS
    CLIENT_URL="http://localhost:3000"
    ```

4.  **Run database migrations:**
    This will set up the database schema based on `prisma/schema.prisma`.
    ```sh
    npx prisma migrate dev
    ```

5.  **Start the server:**
    The server will start, typically on port 5001.
    ```sh
    npm run dev
    ```
    *(Note: Add `"dev": "nodemon src/server.js"` to the `scripts` section in `package.json` to use this command.)*

## Key Concepts

### Optimistic Concurrency Control

To prevent issues like overselling tickets for an event, this system uses optimistic locking. When a reservation is made, the transaction checks the `version` of the event. If the `version` has changed since it was first read, it means another transaction has modified the event (e.g., another user booked a seat), and the current transaction will fail, preventing the race condition. This is handled within a `prisma.$transaction`.

### Caching Strategy

The system uses Redis for caching to enhance performance. API responses for fetching events and reservations are cached. A versioning system is implemented in Redis (e.g., `event:version`). When an event is created or updated, its corresponding version key is incremented. The cache key for requests includes this version (`cache:v1:...`). This ensures that when data changes, all subsequent requests will use a new cache key, effectively invalidating the old cache and fetching fresh data.
