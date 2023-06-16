/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

export class DiagramElement {
    static moduleVarCount = 0;
    static endpointCount = 0;
    static actionNameCount = 0;
    static actionResponseCount = 0;

    static resetGlobalIndexes() {
        this.moduleVarCount = 0;
        this.endpointCount = 0;
        this.actionNameCount = 0;
        this.actionResponseCount = 0;
    }

    static isModuleVarExists(variableName: string) {
        this.waitForDiagramUpdate();
        cy.get('.module-variable-header .module-variable-name-text').eq(this.moduleVarCount++).contains(variableName)
            .scrollIntoView().should('be.visible');
    }

    static isEndpointExists(endpointVarName: string) {
        this.waitForDiagramUpdate();
        cy.get('.connector .endpoint-name').eq(this.endpointCount++).contains(endpointVarName)
            .scrollIntoView().should('be.visible');
    }

    static isActionExists(action: string, responseVarName: string = "") {
        this.waitForDiagramUpdate();
        cy.get('.action-invocation .method-text').eq(this.actionNameCount++).contains(action)
            .scrollIntoView().should('be.visible');
        if (responseVarName !== "") {
            let shortName = responseVarName?.length >= 15 ? responseVarName.slice(0, 10) + "..." : responseVarName;
            cy.get('.action-processor .variable-name').eq(this.actionResponseCount++).contains(shortName)
                .scrollIntoView().should('be.visible');
        }
    }

    private static waitForDiagramUpdate() {
        cy.get(`[id="canvas-overlay"]`)
            .children().should("have.length", 0);
        cy.get(`[data-testid="diagram-loader"]`)
            .should("not.exist");
        return this;
    }
}
