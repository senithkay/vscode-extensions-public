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
export class ParameterTab {

    static selectTab(selectedTab: string) {
        cy.get(`[data-testid="tab-panel-wrapper"]`).within(() => {
            cy.contains("Parameters").focus()
                .wait(500)
                .click({ force: true });
        });
        return this;
    }

    static shouldBeFocused() {
        cy.get(`[data-testid="tab-panel-wrapper"]`).within(() => {
            cy.contains("Parameters").should('have.attr', 'aria-selected').and('eq', 'true');
        });
        return this;
    }

    static shouldHaveParameterList() {
        cy.get(`[data-testid="parameter-list"]`)
            .should('be.visible');
        return this;
    }

    static shouldHaveRequiredArg(name: string) {
        cy.get(`[data-testid="required-arg"]`)
            .should('be.visible')
            .within(() => {
                cy.contains(name)
                    .should('be.visible');
            });

        return this;
    }

    static shouldHaveOptionalArg(name: string) {
        cy.get(`[data-testid="optional-arg"]`)
            .should('be.visible')
            .within(() => {
                cy.contains(name)
                    .should('be.visible');
            });
        return this;
    }

    static toggleOptionalArg(name: string) {
        cy.get(`[data-testid="optional-arg"]`)
            .should('be.visible')
            .children()
            .contains(name)
            .should('be.visible')
            .parent().parent()
            .within(() => {
                cy.get(`[data-testid="arg-check"]`)
                    .click();
            });
        return this;
    }

    // Connector related parameter tab functionalities
    static shouldHaveParameterTree() {
        cy.get(`[data-testid="parameter-tree"]`)
            .should('be.visible');
        return this;
    }

    static shouldHaveRecordArg(name: string) {
        cy.get(`[data-testid="record-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .scrollIntoView();
        return this;
    }

    static toggleRecordArgs(name: string) {
        cy.get(`[data-testid="record-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .scrollIntoView()
            .siblings(`[data-testid="arg-check"]`)
            .click({ force: true })
            .wait(500);
        return this;
    }

    static toggleRecordOptionalArgs(name: string) {
        cy.get(`[data-testid="record-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .parent()
            .parent()
            .scrollIntoView()
            .children()
            .children(`[data-testid="parameter-branch"]`)
            .scrollIntoView()
            .children()
            .children(`[data-testid="optional-toggle-button"]`)
            .scrollIntoView()
            .click({ force: true })
            .wait(500);
        return this;
    }

    static shouldHaveInclusionArg(name: string) {
        cy.get(`[data-testid="inclusion-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .scrollIntoView();
        return this;
    }

    static toggleInclusionArg(name: string) {
        cy.get(`[data-testid="inclusion-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .scrollIntoView()
            .siblings(`[data-testid="arg-check"]`)
            .click({ force: true })
            .wait(1000);
        return this;
    }

    static toggleInclusionOptionalArgs(name: string) {
        cy.get(`[data-testid="inclusion-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .parent()
            .parent()
            .scrollIntoView()
            .children()
            .children(`[data-testid="parameter-branch"]`)
            .children()
            .children(`[data-testid="optional-toggle-button"]`)
            .click({ force: true })
            .wait(500);
        return this;
    }

    static shouldHaveUnionArg(name: string) {
        cy.get(`[data-testid="union-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .scrollIntoView();
        return this;
    }

    static selectUnionArg(name: string, selector: string) {
        cy.get(`[data-testid="union-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .scrollIntoView()
            .siblings(`[data-testid="arg-dropdown"]`)
            .children(`[data-testid="select-dropdown"]`)
            .children(`[data-testid="select-dropdown-data"]`)
            .click({ force: true }); // FIXME: Fix mui select menu item selection
        cy.get(`ul > li[data-value="${selector}"]`)
            .click({ force: true });
        return this;
    }

    static toggleUnionArg(name: string) {
        cy.get(`[data-testid="union-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .scrollIntoView()
            .siblings(`[data-testid="arg-check"]`)
            .click({ force: true })
            .wait(500);
        return this;
    }

    static shouldHaveCustomArg(name: string) {
        cy.get(`[data-testid="custom-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .scrollIntoView();
        return this;
    }

    static toggleCustomArg(name: string) {
        cy.get(`[data-testid="custom-arg"]`)
            .children()
            .children(`[data-testid="arg-name"]`)
            .contains(name)
            .parent()
            .scrollIntoView()
            .siblings(`[data-testid="arg-check"]`)
            .click({ force: true })
            .wait(500);
        return this;
    }
}
