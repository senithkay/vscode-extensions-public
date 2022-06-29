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
export class EditorPane {
    private static parentSelector;

    static getStatementRenderer(){
        cy.get(`[data-testid="statement-renderer"]`);
        return this;
    }

    static getExpression(modelType?:string){
        cy.get(`[data-testid="${modelType}"]`)
        this.parentSelector = `[data-testid="${modelType}"]`;
        return this;
    }

    static clickExpressionContent(text:string){
        cy.get(`${this.parentSelector}`).within(() => {
            cy.contains(`[data-testid="input-editor-span"]`,text)
                .click()
                .parent('[class*="expressionElementSelected"]',{timeout:20000})
        });
        return this;
    }

    static doubleClickExpressionContent(text:string){
        cy.get(`${this.parentSelector}`).within(() => {
            cy.contains(`[data-testid="input-editor-span"]`,text)
                .dblclick();
        })
        return this;
    }

    static doubleClickStatementContent(text:string){
        cy.contains(`[data-testid="input-editor-span"]`,text)
            .dblclick();
        return this;
    }

    static clickSpecificExpression(modelType:string, position?:number, text?:string){
        cy.get(`${this.parentSelector}`).within(() =>{
            cy.get(`[data-testid="${modelType}"]`).eq(position)
                .contains(text)
                .click()
                .parent('[class*="expressionElementSelected"]',{timeout:20000})
        });
        return this;
    }

    static validateNewExpression(modelType:string, text:string){
        cy.contains(`[data-testid="${modelType}"]`,text,{timeout:20000}).should('exist');
        return this;
    }

    static checkForDiagnostics() {
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .should("be.visible");
        return this;
    }

    static validateDiagnosticMessage(diagMessage:string){
        cy.contains(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`,diagMessage)
        return this;
    }

    static checkForMultipleDiagnostics(){
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`).should('have.length.above',1)
        return this;
    }

    static validateEmptyDiagnostics(){
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .should("not.exist", { timeout: 20000 });
        return this;
    }
}
