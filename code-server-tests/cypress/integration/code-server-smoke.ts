/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Code server smoke test", () => {
  const testEndpoint = "http://localhost:9090/";

  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    cy.visit(Cypress.env("workspaceUrl"));
    cy.get("h2", {
      timeout: 120000,
    }).should("be.visible");
  });

  it("Validate vs code is opened without errors and Diagram is rendered", () => {
    cy.get("body").should("not.contain", "error");
    //Disable performance forecasting
    cy.get("body").then((body) => {
      if (
        body.find("div[aria-label='Disable performance forecasting... ']")
          .length > 0
      ) {
        cy.get("div[aria-label='Disable performance forecasting... ']").click();
      }
    });
    //Verify ballerina extension
    cy.contains(
      "div[id='wso2.ballerina']", 
      'Swan Lake', 
      { timeout: 30000 }  
    );  
    cy.get('a[class="action-label codicon codicon-extensions-view-icon"]', {
      timeout: 60000,
    }).click({ force: true });
    cy.get('span[class="name"]').contains("Ballerina");
    cy.get(
      'a[class="action-label codicon codicon-extensions-view-icon"]'
    ).click({ force: true });
    //Close sync notification if visible
    cy.get("body").then((body) => {
      if (body.find("a[title='Sync changes with Choreo']").length > 0) {
        cy.get(
          "a[class='action-label codicon codicon-notifications-clear']"
        ).click();
      }
    });
    //Verify main.bal diagram tab
    // cy.wait(25000);
    // cy.get("div[title='main.bal Diagram']").contains("main.bal Diagram");
    cy.contains(
      "div[title='main.bal Diagram']", 
      'main.bal Diagram', 
      { timeout: 25000 }  
    );  
    cy.wait(10000);
    cy.screenshot();
    //Take a snapshot of the diagram and compare with reference snapshot at /snapshots/code-server-smoke.ts/
    cy.matchImageSnapshot("Low-code-diagram");
  });

  it("Open main bal source and verify the code rendered", () => {
    cy.get("a[title='Show Source']").click();
    cy.wait(1000);
    // Close the diagram
    cy.xpath(
      "//div[@aria-label='main.bal Diagram']/div[@class='tab-actions']//a[@role='button']"
    ).click();
    //Close welcome tab
    cy.xpath(
      "//div[@title='Welcome']/div[@class='tab-actions']//a[@role='button']"
    ).click();
    // Verify code rendering
    cy.get(".view-lines", {
      timeout: 60000,
    }).contains("public function main() {");
  });

  it("Verify issues are displayed in the status bar when code contains errors", () => {
    cy.get("body").should("not.contain", "error");
    // Check no issues are displayed in status bar
    cy.get("a[aria-label='No Problems']").should("be.visible");
    cy.get(
      ".editor-instance > .no-user-select > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines",
      {
        timeout: 60000,
      }
    ).click();
    // Type some random string in to code
    cy.get(
      ".editor-instance > .no-user-select > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines"
    ).type("Some Random text");
    //Verify there is an increase in problem status bar
    cy.get("a[aria-label='No Problems']", { timeout: 60000 }).should(
      "not.exist"
    );
  });
});
