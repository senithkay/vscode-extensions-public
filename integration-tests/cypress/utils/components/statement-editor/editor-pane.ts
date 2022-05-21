export class EditorPane {
    private static parentSelector;

    static getStatementRenderer(){
        cy.get(`[data-testid="statement-renderer"]`);
        return this;
    }

    static getExpression(modelType?:string){
        cy.wait(500)
        cy.get(`[data-testid="${modelType}"]`)
        this.parentSelector = `[data-testid="${modelType}"]`;
        return this;
    }

    static clickExpressionContent(text:string){
        cy.wait(500);
        cy.get(`${this.parentSelector}`).within(() => {
            cy.get(`[data-testid="input-editor-span"]`)
                .contains(text)
                .click();
        })
        return this;
    }

    static doubleClickExpressionContent(text:string){
        cy.wait(500);
        cy.get(`${this.parentSelector}`).within(() => {
            cy.get(`[data-testid="input-editor-span"]`)
                .contains(text)
                .dblclick();
        })
        return this;
    }

    static clickSpecificExpression(modelType:string, position?:number, text?:string){
        cy.wait(500)
        cy.get(`${this.parentSelector}`).within(() =>{
            cy.get(`[data-testid="${modelType}"]`).eq(position)
                .contains(text)
                .click();
        })

        return this;
    }

    static validateDiagnostics(){
        cy.wait(500)
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`);
    }

    static validateDiagnosticMessage(diagMessage:string){
        cy.wait(500)
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .contains(diagMessage)
        return this;
    }

    static checkForMultipleDiagnostics(){
        cy.wait(500)
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`).should('have.length.above',1)
        return this;
    }

    static validateEmptyDiagnostics(){
        cy.wait(500)
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .should("not.exist");
        return this;
    }
}
