type topLevelOptions = 
| "Main"
| "Service"
| "Trigger"
| "Variable"
| "Record"
| "Function"
| "Configurable"
| "Constant"
| "Listener"
| "Enum"
| "Class"
| "Other"
| "Resource";
export class TopLevelPlusWidget {

    static clickOption(optionName: topLevelOptions) {
        return cy.get(".options-wrapper")
        .contains(optionName)
        .click();
    }

}
