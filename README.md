# Peer to Peer Payment Splitter
Creating a payment splitter for groups.

## Technologies
- Node.js >= 21
- Typescript
- Jest

## Project Structure
- Controller Layer: This is the entrypoint responsible for HTTP and CSV parsing (Primary Adapters) in Hexagonal Architecture.
- Domain Layer: This is the core domain logic of groups.
- Service Layer: This is the orchestration layer responsible for ensuring the valid state of group is persisted.
- Adapters (External) Layer: This is the external adapters of our application (Secondary Adapters) in Hexagonal Architecture.

## Documentation

### Design Decision 001: Split Expenses After All Have Been Added
I've experimented with a few approachs on how to add and split expenses. The one that made more sense based on the requirements, was to allow to keep adding expenses, than issue a call to get the current state of expenses split. This is automatically made when the balance is calculated, given it depends on all the current expenses and 

The opposite direction was to calculate the division as each expense is being added in the app. This still seems like a interesting approach to be considered for refactor, but would add extra complexity as each expense should have a parameter to determine. Although having the parameter for split in get balances feels off.

### Design Decision 002: CSV Uploading
I'm considering the CSV files won't be too large to process. If they were, I would consider an API to store the file in S3, which could trigger an event to a queue to process the file in a distributed system. To keep things simple, I will consider the same API endpoint to upload the file is responsible for processing it in the HTTP connection. If it was too large, I could evolve the application to the second approach mentioned before.

## Project Management Tasks
- [x] Setup Node with Typescript in VS Code.
- [x] Setup Jest with Typescript in VS Code.
- [x] Design a initial domain model for the requirements 1 to 4 (core of the application).
- [x] Code and create the unit tests for group creation with a service layer.
- [x] Code and create the unit tests for expenses in a group.
- [x] Add functionality of splitting the expenses between members.
- [x] Create the get balance for members of the group with unit tests.
- [x] Add settelment between members.
- [x] Design the overall REST API endpoints.
- [x] Add schema validation and error handling in the API layer.
- [x] Create Postmam Collection.
- [x] Add CSV upload and processing in the API (requirement 5).
- [x] Fix the bug of float values in the expenses when calculate the balance.
- [ ] Consider a Event Driven Design for Email Notifications.
- [ ] Add Email Notifications with a Fake Message Queue (Event Driven). See the impacts in the current domain mode.
- [ ] Add a DynamoDB for persistance in AWS instead of FakeGroupRepository.
- [ ] Add Email Notification to rely on AWS SQS.
- [ ] Add CSV processing to rely on Amazon S3 for storage (API for upload and processing).
- [ ] Write E2E tests on the API using Jest.
- [ ] Clean up git history.

## Postman Collection
Exported [Project Collection](./docs/payment-splitter.postman_collection.json) using Collections 2.1 from Postman.