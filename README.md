# Peer to Peer Payment Splitter

## Technologies
- Node.js >= 21
- Typescript

## Project Structure

## Documentation

### Design Decisiom: Split Expenses After All Have Been Added
I've experimented with a few approachs on how to add and split expenses. The one that made more sense based on the requirements, was to allow to keep adding expenses, than issue a call to get the current state of expenses split. This is automatically made when the balance is calculated, given it depends on all the current expenses and 

The opposite direction was to calculate the division as each expense is being added in the app, but this seemed to be overcomplicated.

## Project Management
- [x] Setup Node with Typescript.
- [x] Setup Jest with Typescript.
- [x] Design a initial domain model for the requirements 1 to 4 (core of the application).
- [x] Code and create the unit tests for group creation with a service layer.
- [x] Code and create the unit tests for expenses in a group.
- [x] Add functionality of splitting the expenses between members.
- [ ] Create the get balance for members of the group with unit tests.
- [ ] Design the overall REST API endpoints.
- [ ] Create Postmam Collection.
- [ ] Write E2E tests on the API.
- [ ] Add a DynamoDB for persistance in AWS.
- [ ] Add reuirements 5 to 6 (csv and e-mail service.)

