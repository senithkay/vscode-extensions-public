import { topLevelOptions } from "../type-utils";

export class TopLevelPlusWidget {

    static clickOption(optionName: topLevelOptions) {
        return cy.get(".options-wrapper")
            .contains(optionName)
            .click();
    }

}
