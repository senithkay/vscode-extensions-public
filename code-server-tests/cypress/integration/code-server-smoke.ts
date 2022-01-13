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
  const packageName = "test_package_01";
  const serviceName = "test_service_01";

  it("Validate vs code is opened without errors and Ballerina extension is present", () => {
    cy.visit(Cypress.env("workspaceUrl"));
    cy.get(".category-description-container > .category-title", {
      timeout: 60000,
    })
      .should("be.visible")
      .contains("Get Started with VS Code");
    cy.get("body").should("not.contain", "error");
    cy.get("h2", {
      timeout: 60000,
    }).should("be.visible");
    //Verify extension
    // cy.get("div[id='wso2.ballerina']").contains("Ballerina SDK: Swan Lake");
    cy.get('a[class="action-label codicon codicon-extensions-view-icon"]', {
      timeout: 60000,
    }).click();
    cy.get('span[class="name"]').contains("Ballerina");
    // Go to package and open bal
    cy.get(
      'a[class="action-label codicon codicon-explorer-view-icon"]'
    ).click();
    cy.get("body").then(($body) => {
      if ($body.find("div[aria-label='main.bal']").length == 0) {
        cy.get('a[class="label-name"]').contains(packageName);
        cy.xpath("//span[text()='test_package_01']").click();
      }
    });
    cy.get("div[aria-label='main.bal']").click();
    cy.wait(6000);
    //Verify the lines in opened bal
    cy.get(".view-lines", { timeout: 60000 }).contains(
      "public function main() {"
    );
  });

  it.skip("Run the main", () => {
    cy.get("a[title='Run']").click();
    cy.wait(38000);
    cy.get(
      '[style=""] > .monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view > .terminal-split-pane > .terminal-wrapper > :nth-child(1) > .terminal > .xterm-screen > .xterm-cursor-layer'
    ).should("contain", "Hello, World!");
  });

  it("Verify issues are displayed in the status bar when code contains errors", () => {
    cy.get("a[aria-label='No Problems']").should("be.visible");
    cy.get(".view-lines", { timeout: 60000 }).click();
    //Type some random string in to code
    cy.get(".view-lines").type("Some Random text");
    //Verify there is an increase in problem status bar
    cy.get("a[aria-label='No Problems']", { timeout: 60000 }).should(
      "not.exist"
    );
  });

  it("Open a service bal and verify the code rendered", () => {
    cy.get("body").then(($body) => {
      if ($body.find("div[aria-label='service.bal']").length == 0) {
        cy.get('a[class="label-name"]').contains(serviceName).click();
      }
    });
    cy.get("div[aria-label='service.bal']").click();
    // Verify code rendering
    cy.get(".view-lines", { timeout: 60000 }).contains(
      "service /hello on new http:Listener(9090)"
    );
  });
});
