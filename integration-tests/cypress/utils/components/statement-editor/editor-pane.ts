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
            cy.get(`[data-testid="input-editor-span"]`)
                .contains(text)
                .click();
        })
        return this;
    }

    static doubleClickExpressionContent(text:string){
        cy.get(`${this.parentSelector}`).within(() => {
            cy.get(`[data-testid="input-editor-span"]`)
                .contains(text)
                .dblclick();
        })
        return this;
    }

    static clickSpecificExpression(modelType:string, position?:number, text?:string){
        cy.get(`${this.parentSelector}`).within(() =>{
            cy.get(`[data-testid="${modelType}"]`).eq(position)
                .contains(text)
                .click();
        })

        return this;
    }

    static validateNewExpression(modelType:string, text:string){
        cy.get(`[data-testid="${modelType}"]`)
            .contains(text);
        return this;
    }

    static validateDiagnostics(){
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`);
    }

    static validateDiagnosticMessage(diagMessage:string){
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .contains(diagMessage)
        return this;
    }

    static checkForMultipleDiagnostics(){
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`).should('have.length.above',1)
        return this;
    }

    static validateEmptyDiagnostics(){
        cy.get(`[data-testid="diagnostics-pane"] [data-testid="diagnostic-message"]`)
            .should("not.exist");
        return this;
    }
}
