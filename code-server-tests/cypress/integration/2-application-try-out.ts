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

describe("Validate VS code", () => {
  it("initial test verification", () => {
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
    cy.get('a[class="action-label codicon codicon-extensions-view-icon"]', {
      timeout: 60000,
    }).click();
    cy.get('span[class="name"]').contains("Ballerina");

    // Go to workspace
    cy.get(
      'a[class="action-label codicon codicon-explorer-view-icon"]'
    ).click();

    cy.get("body").then(($body) => {
      if ($body.find("div[aria-label='main.bal']").length == 0) {
        cy.get('a[class="label-name"]').contains("test_project_01").click();
      } else {
        //you get here if the button DOESN'T EXIST
      }
    });

    cy.get("div[aria-label='main.bal']").click();
    cy.get(".view-lines").contains("public function main() {");
  });
});
