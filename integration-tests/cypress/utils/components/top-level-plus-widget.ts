export class TopLevelPlusWidget {

    static clickOption(optionName: string) {
        return cy.get(".options-wrapper")
        .contains(optionName)
        .click();
    }

}
