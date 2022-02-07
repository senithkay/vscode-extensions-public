import { BlockLevelPlusWidget } from "./block-level-plus-widget";

export class FunctionDiagram {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) { }

    public shouldBeRenderedProperly() {
        this.container.within(() => {
            cy.get('.diagram-canvas .start-wrapper .start-button .start-text')
                .should("be.visible")
                .should("have.text", " START  ");
        })
        return this;
    }

    public clickDefaultWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`)
                .click();
        })
        return this;
    }

    //This is not working
    public clickIfConditionWorkerPlusBtn(index: number = 0) {
        this.container.within(() => {
            cy.get(`.diagram-canvas .if-else`).within(() => {
                cy.get(`.main-plus-wrapper[data-plus-index="${index}"] svg.plus-holder #SmallPlus`)
                    .not('.else-line')
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
                    .not('.else-line')
                    .click();

            })
        })
        return this;
    }

    public getBlockLevelPlusWidget() {
        return new BlockLevelPlusWidget(this.container);
    }

}
