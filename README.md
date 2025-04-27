# Peer to Peer Payment Splitter

## Technologies
- Node.js >= 21
- Typescript

## Project Structure

## Documentation

### Design Decision 001: Split Expenses After All Have Been Added
I've experimented with a few approachs on how to add and split expenses. The one that made more sense based on the requirements, was to allow to keep adding expenses, than issue a call to get the current state of expenses split. This is automatically made when the balance is calculated, given it depends on all the current expenses and 

The opposite direction was to calculate the division as each expense is being added in the app. This still seems like a interesting approach to be considered for refactor, but would add extra complexity as each expense should have a parameter to determine. Although having the parameter for split in get balances feels off.

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
- [ ] Add a DynamoDB for persistance in AWS instead of FakeGroupRepository.
- [ ] The Design Decision 001 felt off in the tests and API. Consider refactoring it.
- [ ] Write E2E tests on the API.
- [ ] Add requirements 5 to 6 (csv and e-mail service).

