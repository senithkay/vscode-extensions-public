export class BlockLevelPlusWidget {

    static clickOption(optionName: string) {
        return cy.get(".initPlus-container .element-options .options-wrapper .sub-option.enabled .text-label")
        .contains(optionName)
        .click();
    }

}
