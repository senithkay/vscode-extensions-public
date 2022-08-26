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
export class SuggestionsPane {

    static clickSuggestionsTab(selectedTab: string) {
        cy.get(`[data-testid="tab-panel-wrapper"]`).within(() => {
            cy.contains(selectedTab).focus()
                .wait(500)
                .click({ force: true })
        });
        return this;
    }

    static tabShouldFocused(selectedTab: string) {
        cy.get(`[data-testid="tab-panel-wrapper"]`).within(() => {
            cy.contains(selectedTab).should('have.attr', 'aria-selected').and('eq', 'true')
        });
        return this;
    }

    static clickLsSuggestion(selectedSuggestion: string) {
        cy.wait(500)
        cy.get(`[data-testid="suggestion-list"]`).within(() => {
            cy.contains(`[data-testid="suggestion-value"]`, selectedSuggestion)
                .click({ force: true })
        });
        return this;
    }

    static clickLsTypeSuggestion(selectedSuggestion: string) {
        cy.wait(500)
        cy.get(`[data-testid="suggestion-list"]`).within(() => {
            cy.contains(`[data-testid="suggestion-value"]`, selectedSuggestion).should((elem) => {
                expect(elem.text()).to.equal(selectedSuggestion);
            })
                .click({ force: true })
        });
        return this;
    }

    static clickExpressionSuggestion(selectedExpression: string) {
        cy.get(`[data-testid="expression-list"]`).within(() => {
            cy.contains(selectedExpression)
                .click({ force: true })
        })
        return this;
    }

    static clickLibrarySuggestion(selectedLib: string) {
        cy.get(`[data-testid="library-list-block"]`).within(() => {
            cy.contains(selectedLib)
                .click({ force: true })
        })
        return this;
    }

    static clickSearchedLibSuggestion(searchedLib: string) {
        cy.get(`[data-testid="library-element-block-content"]`).within(() => {
            cy.contains(searchedLib)
                .click({ force: true })
        })
        return this;
    }

    static clickOnLibraryDropdown(mode: string) {
        cy.get(`[data-testid="library-type-selector"]`).within(() => {
            cy.get(`.MuiSelect-select[role="button"]`)
                .click();
        });
        cy.get(`ul.MuiMenu-list li span.TextSpan`)
            .contains(mode)
            .click();
        return this;
    }

    static validateFilteredLib(clearedLib: string) {
        cy.get(`[data-testid="library-list-block"]`)
            .children().should('not.contain', clearedLib)
        return this;
    }

    static typeExpressionInSearchBar(suggestion:string){
        cy.get(`[data-testid="expr-suggestions-searchbar"]`)
            .children('input')
            .clear()
            .type(suggestion);
        return this;
    }

    static validateUnrelatedSuggestions(suggestion:string){
        cy.get(`[data-testid="expression-list"]`)
            .children().should('not.contain',suggestion)
        return this;
    }
}
