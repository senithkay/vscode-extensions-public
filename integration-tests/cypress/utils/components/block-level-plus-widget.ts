import { optionNames } from "../type-utils";

export class BlockLevelPlusWidget {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    public clickOption(optionName: optionNames, force?: boolean) {
        this.container.within(() => {
            cy.get(".element-options .options-wrapper .sub-option.enabled .text-label")
            .contains(optionName)
            .click({force: force || false});
        })
    }

}
