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
