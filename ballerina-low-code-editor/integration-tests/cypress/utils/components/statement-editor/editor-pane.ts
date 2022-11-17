import { modelTypes } from "../../type-utils";
import { InputEditor } from "./input-editor";

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
        const startDate = new Date();
        cy.task('log', `Started to wait for statement render at ${startDate}`);
        cy.wait(2000);
        cy.get(`[data-testid="statement-renderer"]`);
        const endDate = new Date();
        cy.task('log', `Found statement render at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static getExpression(modelType?: modelTypes){
        const startDate = new Date();
        cy.task('log', `Started to wait for expression-${modelType} at ${startDate}`);
        cy.wait(1500);
        cy.get(`[data-testid="${modelType}"]`);
        const endDate = new Date();
        cy.task('log', `Found expression-${modelType} at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        this.parentSelector = `[data-testid="${modelType}"]`;
        return this;
    }

    static clickExpressionContent(text:string){
        const startDate = new Date();
        cy.task('log', `Started to wait for expression content-${text} at ${startDate}`);
        cy.wait(1500);
        cy.get(`${this.parentSelector}`).within(() => {
            cy.contains(`[data-testid="input-editor-span"]`,text)
                .should('be.visible')
                .click()
                // .parent('[class*="expressionElementSelected"]',{timeout:20000})
        });
        const endDate = new Date();
        cy.task('log', `Found expression-${text} content at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static clickStatementContent(text:string){
        cy.wait(1500);
        cy.contains(`[data-testid="input-editor-span"]`,text)
            .should('be.visible')
            .click();
        return this;
    }

    static doubleClickExpressionContent(text:string){
        const startDate = new Date();
        cy.task('log', `Started to wait for double click expression-${text} at ${startDate}`);
        cy.wait(1500);
        cy.get(`${this.parentSelector}`).within(() => {
            cy.contains(`[data-testid="input-editor-span"]`,text)
                .should('be.visible')
                .dblclick()
        });
        const endDate = new Date();
        cy.task('log', `Found double clicked expression-${text} content at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static doubleClickStatementContent(text:string){
        const startDate = new Date();
        cy.task('log', `Started to wait for double click statement content-${text} at ${startDate}`);
        cy.wait(1500);
        cy.contains(`[data-testid="input-editor-span"]`,text)
            .should('be.visible')
            .dblclick();
        const endDate = new Date();
        cy.task('log', `Found double clicked statement-${text} content at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static clickTokenContent(token:string){
        cy.wait(1500);
        cy.contains(`[class*="expressionBlock"]`,token)
            .click();
        return this;
    }

    static clickSpecificExpression(modelType:string, position?:number, text?:string){
        cy.wait(1500);
        cy.get(`${this.parentSelector}`).within(() =>{
            cy.get(`[data-testid="${modelType}"]`).eq(position)
                .contains(text)
                .click()
                .parent('[class*="expressionElementSelected"]')
        });
        return this;
    }

    static ClickHoverPlusOfExpression(modelType:string, plusBtnPos?:number, text?:string){
        cy.wait(1000);
            cy.get(`[data-testid="${modelType}"]`)
                .contains(text)
                .trigger('mouseover');
            cy.get(`[data-testid="plus-button"]`).eq(plusBtnPos)
                .click();
            cy.wait(1000);
        return this;
    }

    static clickPlusButton() {
        cy.wait(1000);
        cy.contains(`[data-testid="plus-button"]`,`+`)
            .realHover()
            .click();
        cy.wait(1000);
        return this;
    }

    static clickPlusRecordFieldPlus(fieldName: string) {
        cy.wait(1000);
        cy.get(`#${fieldName}`)
            .realHover()
            .click();
        return this;
    }

    static clickMinusButton() {
        cy.wait(1000);
        cy.contains(`[data-testid="minus-button"]`,`-`)
            .click();
        cy.wait(1000);
        return this;
    }

    static validateNewExpression(modelType:string, text:string){
        cy.wait(1000);
        cy.contains(`[data-testid="${modelType}"]`,text).should('exist');
        return this;
    }

    /**
     * Re triggering diagnostic call to activate save button in the st-editor
     */
    static reTriggerDiagnostics(modelType: string, text: string) {
        this.getExpression(modelType);
        this.doubleClickExpressionContent(text);
        InputEditor.escapeInput();
        return this;
    }

    static checkForDiagnostics() {
        cy.wait(1000);
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .should("be.visible");
        return this;
    }

    static validateDiagnosticMessage(diagMessage:string){
        cy.wait(1000);
        cy.contains(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`,diagMessage);
        return this;
    }

    static checkForMultipleDiagnostics(){
        cy.wait(1000);
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`).should('have.length.above',1);
        return this;
    }

    static validateEmptyDiagnostics(){
        cy.wait(1000);
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .should("not.exist");
        return this;
    }

    static checkForSyntaxDiagnosticsHighlighting() {
        cy.wait(1000);
        cy.get(`[data-testid="syntax-error-highlighting"]`)
            .should("be.visible");
        return this;
    }
}
