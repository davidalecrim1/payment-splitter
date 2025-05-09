# Peer-to-Peer Payment Splitter
A back-end system that simplifies and automates group expense splitting for peer-to-peer payments.

## Business Goal
Managing shared expenses in groups—whether among friends, roommates, or colleagues—often leads to friction, miscommunication, and manual tracking headaches. This system provides a reliable and transparent backend infrastructure to split payments fairly within a group, ensuring that:
* Every participant clearly sees who owes what, and why.
* The system automatically maintains accurate balances as group expenses evolve.
* Consistency is enforced across all payment interactions, even as group members or transactions change.

At its core, the **Group** acts as a *consistency boundary* and an *aggregate root*, ensuring that all operations maintain a valid and predictable state across the group.

## Technologies
* Node.js >= 21
* Typescript
* Jest

## Project Structure
The architecture follows **Hexagonal Architecture** (a.k.a. Ports and Adapters), designed to keep the business logic independent and testable, while facilitating interaction with external systems.
* **Controller Layer** *(Primary Adapters)*
  Handles HTTP requests and CSV uploads. This is the entry point where external interfaces interact with the system.
* **Domain Layer**
  Contains the core business logic for groups and payments. This is the heart of the application where invariants and rules are enforced.
* **Service Layer**
  Orchestrates use cases, ensuring that group states remain valid after complex operations (e.g., adding expenses, splitting payments).
* **Adapters Layer** *(Secondary Adapters)*
  Interfaces with external systems (e.g., databases, payment gateways). Isolates infrastructure concerns from core logic.

## Documentation

### API Documentation
> TODO: Integrate Swagger UI for interactive API documentation.

### Domain Model
The **Group** is the central aggregate of the system. It encapsulates:

* The list of participants.
* The shared expenses and their allocations.
* The rules ensuring payment balances are valid and up to date.

By treating the group as a consistency boundary, we guarantee atomic updates and business rule integrity, minimizing disputes and edge cases common in peer-to-peer expense splitting.

## Postman Collection
You can explore and test the API endpoints using the exported [Project Collection](./docs/payment-splitter.postman_collection.json) (Postman Collections v2.1).