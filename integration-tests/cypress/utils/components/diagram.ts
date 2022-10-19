import { BlockLevelPlusWidget } from "./block-level-plus-widget";

export class FunctionDiagram {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) { }

    public shouldBeRenderedProperly() {
        this.container.within(() => {
            cy.get('.diagram-canvas .start-wrapper .start-button .start-text', { timeout: 50000 })
                .should("be.visible")
                .should("have.text", "STARTSTART");
        })
        return this;
    }

    public clickDefaultWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .function-body`, { timeout: 50000 })
                .children('g')
                .not('.worker-body')
                .find(`.main-plus-wrapper[data-plus-index="${index}"]`, { timeout: 50000 })
                .click();
        })
        return this;
    }

    public clickWokerPlusBtn(workerName: string, plusIndex: number = 0) {
        cy.get(`.diagram-canvas .function-body g#worker-${workerName}`, { timeout: 50000 })
            .find(`.main-plus-wrapper[data-plus-index="${plusIndex}"]`, { timeout: 50000 })
            .click();
        return this;
    }

    public clickExistingReturnStatement() {
        this.container.within(() => {
            cy.get(`.diagram-canvas .return-contect-wrapper [data-testid="editBtn"]`, { timeout: 50000 }).click({ force: true });
        })
        return this;
    }

    public deleteExistingReturnStatement() {
        this.container.within(() => {
            cy.get(`.diagram-canvas .return-contect-wrapper [data-testid="deleteBtn"]`, { timeout: 50000 }).click({ force: true });
        })
        return this;
    }

    //This is not working
    public clickIfConditionWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .if-else .if-body-pluses`, { timeout: 50000 }).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`, { timeout: 50000 })
                    .click();
            })
        })
        return this;
    }

    public clickIfConditionElseWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .else-line .main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`, { timeout: 50000 })
                .click();
        })
        return this;
    }

    public clickForEachWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-foreach-wrapper`, { timeout: 50000 }).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`, { timeout: 50000 })
                    .click();

            })
        })
        return this;
    }

    public clickWhileWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .while-wrapper`, { timeout: 50000 }).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`, { timeout: 50000 })
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
        cy.get(`.diagram-canvas .main-process-wrapper .process-options-wrapper [data-testid="editBtn"]`, { timeout: 50000 })
            .click({ force: true });
        return this;
    }

    public deleteExistingLogStatement() {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-process-wrapper .process-options-wrapper [data-testid="deleteBtn"]`, { timeout: 50000 }).click({ force: true });
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
            cy.get(`.diagram-canvas .main-process-wrapper[target-line="${targetLine}"] .process-options-wrapper [data-testid="deleteBtn"]`, { timeout: 50000 })
                .click({ force: true });
        })
        return this;
    }

    public shouldHavePerfBar() {
        this.container.within(() => {
            cy.get('.performance-bar .rectangle', { timeout: 50000 })
                .should("be.visible");
        })
        return this;
    }

    public getAdvancedPerfData() {
        this.container.within(() => {
            cy.get('.performance-bar .more', { timeout: 50000 }).click();
        })
        return this;
    }

    public assertPerfText(text: string) {
        this.container.within(() => {
            return cy.get('.performance-bar', { timeout: 50000 }).find('p').first().should(
                "have.text",
                text
            )
        })
    }

    public assertPerfLabel(index: number, text: string) {
        this.container.within(() => {
            return cy.get('.performance', { timeout: 50000 }).eq(index).find('tspan').should(
                "have.text",
                text
            )
        })
    }

    public assertPerfButton(text: string) {
        this.container.within(() => {
            cy.get('.performance-bar .more', { timeout: 50000 }).as("perfBtn")
        });
        cy.get('@perfBtn', { timeout: 50000 }).realClick().invoke('attr', 'aria-describedby').as("perfToolTipId")
            .then(($perfToolTipId) => {
                return cy.get('#' + $perfToolTipId).first().should(
                    "have.text",
                    text
                )
            });
    }

    public clickEditExistingBlockStatement(targetLine: number) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-process-wrapper[target-line="${targetLine}"] .process-options-wrapper [data-testid="editBtn"]`, { timeout: 50000 })
                .click({ force: true });
        })
        return this;
    }


    public assertControlFlowLineCount(count: number) {
        this.container.within(() => {
            return cy.get('.control-flow-line', { timeout: 50000 }).should(
                "have.length",
                count
            )
        })
    }

    public clickEditOnExistingEndpointStatement(targetLine: number) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-connector-process-wrapper[target-line="${targetLine}"] .connector-process-options-wrapper [data-testid="editBtn"]`, { timeout: 50000 })
                .click({ force: true });
        });
        return this;
    }
}
