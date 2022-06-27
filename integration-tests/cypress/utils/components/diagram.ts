import { BlockLevelPlusWidget } from "./block-level-plus-widget";

export class FunctionDiagram {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) { }

    public shouldBeRenderedProperly() {
        this.container.within(() => {
            cy.get('.diagram-canvas .start-wrapper .start-button .start-text')
                .should("be.visible")
                .should("have.text", "STARTSTART");
        })
        return this;
    }

    public clickDefaultWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .function-body`)
                .children('g')
                .not('.worker-body')
                .find(`.main-plus-wrapper[data-plus-index="${index}"]`)
                .click();
        })
        return this;
    }

    public clickWokerPlusBtn(workerName: string, plusIndex: number = 0) {
        cy.get(`.diagram-canvas .function-body g#worker-${workerName}`)
            .find(`.main-plus-wrapper[data-plus-index="${plusIndex}"]`)
            .click();
        return this;
    }

    public clickExistingReturnStatement() {
        this.container.within(() => {
            cy.get(`.diagram-canvas .return-contect-wrapper [data-testid="editBtn"]`).click({ force: true });
        })
        return this;
    }

    public deleteExistingReturnStatement() {
        this.container.within(() => {
            cy.get(`.diagram-canvas .return-contect-wrapper [data-testid="deleteBtn"]`).click({ force: true });
        })
        return this;
    }

    //This is not working
    public clickIfConditionWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .if-else .if-body-pluses`).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`)
                    .click();
            })
        })
        return this;
    }

    public clickIfConditionElseWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .else-line .main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`)
                .click();
        })
        return this;
    }

    public clickForEachWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-foreach-wrapper`).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`)
                    .click();

            })
        })
        return this;
    }


    public clickWhileWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .while-wrapper`).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`)
                    .not('.else-line')
                    .click();

            })
        })
        return this;
    }

    public getBlockLevelPlusWidget() {
        return new BlockLevelPlusWidget();
    }

    public clickExistingLogStatement() {
        cy.get(`.diagram-canvas .main-process-wrapper .process-options-wrapper [data-testid="editBtn"]`)
            .click({ force: true });
        return this;
    }

    public deleteExistingLogStatement() {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-process-wrapper .process-options-wrapper [data-testid="deleteBtn"]`).click({ force: true });
        })
        return this;
    }

    public clickExistingRespondStatement() {
        cy.get(`.diagram-canvas .respond-contect-wrapper [data-testid="editBtn"]`)
            .click({ force: true });
        return this;
    }

    public clickDeleteExistingBlockStatement(targetLine: number) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-process-wrapper[target-line="${targetLine}"] .process-options-wrapper [data-testid="deleteBtn"]`)
                .click({ force: true });
        })
        return this;
    }

    public shouldHavePerfBar() {
        this.container.within(() => {
            cy.get('.performance-bar .rectangle')
                .should("be.visible");
        })
        return this;
    }

    public getAdvancedPerfData() {
        this.container.within(() => {
            cy.get('.performance-bar .more').click();
        })
        return this;
    }

    public assertPerfText(text: string) {
        this.container.within(() => {
            return cy.get('.performance-bar').find('p').first().should(
                "have.text",
                text
            )
        })
    }

    public assertPerfLabel(index: number, text: string) {
        this.container.within(() => {
            return cy.get('.performance').eq(index).find('tspan').should(
                "have.text",
                text
            )
        })
    }

    public assertPerfButton(text: string) {
        this.container.within(() => {
            cy.get('.performance-bar .more').as("perfBtn")
        });
        cy.get('@perfBtn').realClick().invoke('attr', 'aria-describedby').as("perfToolTipId")
            .then(($perfToolTipId) => {
                return cy.get('#' + $perfToolTipId).first().should(
                    "have.text",
                    text
                )
            });
    }
}
