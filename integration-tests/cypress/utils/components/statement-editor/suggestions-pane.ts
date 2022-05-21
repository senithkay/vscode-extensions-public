export class SuggestionsPane {

    static clickSuggestionsTab(selectedTab: string) {
        cy.wait(500)
        cy.get(`[data-testid="tab-panel-wrapper"]`).within(() => {
            cy.contains(selectedTab)
                .click()
        });
        return this;
    }

    static clickLsSuggestion(selectedSuggestion: string) {
        cy.wait(500)
        cy.get(`[data-testid="suggestion-list"]`).within(() => {
            cy.contains(selectedSuggestion)
                .click();
        });
        return this;
    }

    static clickExpressionSuggestion(selectedExpression: string) {
        cy.wait(500)
        cy.get(`[data-testid="expression-list"]`).within(() => {
            cy.contains(selectedExpression)
                .click()
        })
        return this;
    }
}
