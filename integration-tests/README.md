# Overview

This project is used for integration testing

## Developer Guide

### Local Development

Navigate inside this folder (integration-tests) from terminal

First Start local servers by, ```npm run start-servers```

To Open cypress window to run each test on browser: ``` npm run cypress ```

To Run all the tests in background: ``` npx cypress run ```

To Run Specific test folder: ``` npx cypress run --spec cypress/integration/block-level/variable/*spec.ts ```

Coverage reports will be saved in coverage folder.

## Links

- [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
