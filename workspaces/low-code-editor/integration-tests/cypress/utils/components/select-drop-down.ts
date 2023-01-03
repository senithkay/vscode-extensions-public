export class SelectDropDown {

    private constructor(private fieldName: string, private parentSelector: string) {}

    static getForField(fieldName: string, parentSelector: string = '') {
        return new SelectDropDown(fieldName, parentSelector);
    }

    private getDropDown() {
        return cy.get(`${this.parentSelector} [data-testid="select-drop-down"][data-field-name="${this.fieldName}"]`);
    }

    public select(text: string) {
        this.getDropDown().within(() => {
            cy.get(`.MuiSelect-select[role="button"]`)
                .click();            
        });
        cy.get(`ul.MuiMenu-list li span.TextSpan`)
                .contains(text)
                .click();
        return this;
    }


}
