import { blockLevelOptions } from "../type-utils";

export class BlockLevelPlusWidget {

    static clickOption(optionName: blockLevelOptions, force?: boolean) {
        return cy.get(".form-generator .holder-wrapper-large .options-wrapper .sub-option.enabled .text-label")
            .contains(optionName)
            .click({force: force || false});
    }

}
