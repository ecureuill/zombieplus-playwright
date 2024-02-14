![poster](https://raw.githubusercontent.com/qaxperience/thumbnails/main/playwright-zombie.png)

:construction_worker: in development

# Playwright E2E Test Project for ZombiePlus 
	
This project is an automated test suite for ZombiePlus, a zombie-themed movie and series streaming service. The tests are written using Playwright, an end-to-end testing framework for web applications.
It is the result of the Playwright Zombie Edition course held at [QaXperience](https://qaxperience.com).

## Technologies Used
- Playwright: A versatile library tailored for browser automation with a focus on reliability.
- TypeScript: A statically typed superset of JavaScript.
- PostgreSQL: Relational database management system
- async-mutex: Library for asynchronous mutual exclusion

## Project Structure
The project adopts a structured approach to maintainability and scalability. Here's an overview of the project's directory structure:

```
zombieplus-playwright/
├── fixtures/
│   ├── utils
│   │   ├── Api.ts
│   │   ├── db.ts
│   │   └── data.model.ts
│   ├── data/
│   │   ├── covers/
│   │   │   ├── movies/
│   │   │   └── tvshows/
│   │   ├── leads.json
│   │   ├── login.json
│   │   ├── movies.json
│   │   └── tvshows.json
├── tests/
│   ├── components/
│   │   ├── ModalComponent.ts
│   │   └── ...
│   ├── pages/
│   │   ├── HomePage.ts
│   │   └── ...
│   ├── e2e/
│   │   └── home.spec.ts
│   │   └── ... 
├── playwright.config.js
├── node_modules/
├── package.json
├── tsconfig.json
└── ...
```

## Page Objects and Componentization
This project follows the Page Object Model (POM) design pattern. In POM, each page is represented by a class, and interactions with the page are encapsulated in the methods of that class. This makes the tests more readable, reusable, and easy to maintain.

In addition, this project makes extensive use of components, which are classes that encapsulate the interaction logic with specific parts of a page. For example, we have components for the search bar, the header, and the leads table.

## API Requests and DataBase queries
This project makes use of direct database manipulation and the ZombiePlus API.

Before each test, the database state is cleaned to ensure a consistent testing environment. This is done using the `pg` package to interact directly with the PostgreSQL database.

In addition, some tests insert records into the database using the ZombiePlus API. This allows the tests to run quickly, without the need to interact with the user interface.

## Mutex
A mutex (or mutual exclusion) is used in this project to ensure that only one test can interact with the database at a time. This is necessary to avoid race conditions if multiple tests try to change the database at the same time.

## Test Data

The test data for this project is stored in separate files for each feature of the application. For example, the data for creating, deleting, and searching for leads is stored in the leads.json file, while the data for registering and managing movies is stored in the movies.json file.

Using separate files for each feature has several advantages. It makes the tests easier to write and maintain, as the test data can be updated in a single location for each feature. It also allows the tests to be run with a variety of data, which can reveal bugs that would not be discovered otherwise.

Moreover, this approach allows us to simulate different user behaviors and scenarios more realistically, contributing to more robust and reliable tests.

## Testing Coverage

### Home Page
1. Test the display of featured movies / tvshows on the home page.
1. Test successful lead creation with valid details.
1. Test unsuccessful lead creation with duplicate email.
1. Test unsuccessful lead creation with invalid data (blank name and/or email; invalid email).

### Admin Login Page

1. Test successful login with valid credentials.
1. Test unsuccessful login with invalid credentials.
1. Test unsuccessful login with empty credentials (blank password and/or email; invalid email).

### Movies Page
1. Test successful movie creation with valid details.
1. Test unsuccessful movie creation with duplicate title.
1. Test unsuccessful movie creation without required details.
1. Test successful movie deletion.
1. Test successful movie search with existing title.
1. Test unsuccessful movie search with non-existing title.

### TV Shows Page
1. Test successful tv shows creation with valid details.
1. Test unsuccessful tv shows creation with duplicate title.
1. Test unsuccessful tv shows creation without required details.
1. Test successful tv shows deletion.
1. Test successful tv shows search with existing title.
1. Test unsuccessful tv shows search with non-existing title.

### Leads Page

1. Test successful lead deletion.
1. Test successful lead search with existing email.
