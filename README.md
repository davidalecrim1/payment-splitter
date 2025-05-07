# Peer to Peer Payment Splitter
Creating a back-end system for payment split for groups.

## Technologies
- Node.js >= 21
- Typescript
- Jest

## Project Structure
- Controller Layer: This is the entrypoint responsible for HTTP and CSV parsing (Primary Adapters) in Hexagonal Architecture.
- Domain Layer: This is the core domain logic of groups.
- Service Layer: This is the orchestration layer responsible for ensuring the valid state of group is persisted.
- Adapters Layer: This is the external adapters of our application (Secondary Adapters) in Hexagonal Architecture.

## API Documentation
TODO: Add Swagger UI.

## Postman Collection
Exported [Project Collection](./docs/payment-splitter.postman_collection.json) using Collections 2.1 from Postman.