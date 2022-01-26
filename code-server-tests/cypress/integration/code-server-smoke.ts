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
  after(() => {
    cy.get("a[title='Close Panel']").click();
  });

  it("Validate vs code is opened without errors and Ballerina extension is present", () => {
    cy.visit(Cypress.env("workspaceUrl"));
    cy.get("h2", {
      timeout: 60000,
    }).should("be.visible");

    cy.get("body").should("not.contain", "error");
    cy.get("div[aria-label='Disable performance forecasting... ']").click();
    cy.screenshot();
    //Verify extension
    cy.get("div[id='wso2.ballerina']", { timeout: 60000 }).contains(
      "Ballerina SDK: Swan Lake"
    );
    cy.get('a[class="action-label codicon codicon-extensions-view-icon"]', {
      timeout: 60000,
    }).click();
    cy.get('span[class="name"]').contains("Ballerina");

    //Verify service.bal diagram tab
    cy.get("div[title='service.bal Diagram']").contains("service.bal Diagram");
    cy.wait(8000);
    cy.matchImageSnapshot("Low-code-diagram");
    // home-page-first-render is name of snapshot image
  });

  it("Open a service bal source and verify the code rendered", () => {
    cy.get("a[title='Show Source']").click();
    cy.wait(1000);
    // Close the diagram
    cy.xpath(
      "//div[@aria-label='service.bal Diagram']/div[@class='tab-actions']//a[@role='button']"
    ).click();
    cy.xpath(
      "//div[@title='Welcome']/div[@class='tab-actions']//a[@role='button']"
    ).click();
    // Verify code rendering
    cy.get(".view-lines", {
      timeout: 60000,
    }).contains("service /hello on new http:Listener(9090)");
  });

  it("Verify issues are displayed in the status bar when code contains errors", () => {
    cy.get("a[aria-label='No Problems']").should("be.visible");
    // cy.get(
    //   ".editor-instance > .no-user-select > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines",
    //   {
    //     timeout: 60000,
    //   }
    // ).click();
    //Type some random string in to code
    // cy.get(
    //   ".editor-instance > .no-user-select > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines"
    // ).type("Some Random text");
    // //Verify there is an increase in problem status bar
    // cy.get("a[aria-label='No Problems']", { timeout: 60000 }).should(
    //   "not.exist"
    // );
    // // Undo the added code
    // cy.get(
    //   ".editor-instance > .no-user-select > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines"
    // ).type("{control}z{control}z{control}z");
  });

  it("Run the Service and invoke api ", () => {
    cy.get("a[title='Run']").click();
    cy.wait(38000);
    // cy.get("div[class='outline-element monaco-breadcrumb-item']", {
    //   timeout: 38000,
    // }).contains("service /hello ");
    cy.request({
      method: "GET",
      url: "http://localhost:9090/hello/sayHello?name=Test user",
      headers: {
        accept: "text/plain",
      },
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.eq("Hello, Test user");
    });
  });
});
