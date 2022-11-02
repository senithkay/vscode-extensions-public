import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";

export class ListenerForm {

    private static selector = '[data-testid="listener-form"]';


    static selectType(type: "HTTP") {
        SelectDropDown
            .getForField("Select TypeHTTP", this.selector)
            .select(type);
        return this;
    }

    static typeListenerName(name: string) {
        const typeInput = `{selectall}${name}`;
        this.getForm()
            .get('[data-testid="listener-name"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    static clearListenername() {
        const typeInput = `{selectall}{del}`;
        this.getForm()
            .get('[data-testid="listener-name"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    static clearPortValue() {
        const typeInput = `{selectall}{del}`;
        this.getForm()
            .get('[data-testid="listener-port"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    static typeListenerPortValue(value: string) {
        const typeInput = `{selectall}${value}`;
        this.getForm()
            .get('[data-testid="listener-port"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    private static getForm() {
        return cy
            .get(this.selector);

    }

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;

    }

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;
    }

    static saveShouldBeDisabled() {
        this.getForm()
            .contains("Save")
            .should('be.disabled', { timeout: 5000 })
        return this;
    }

    static saveShouldBeEnabled() {
        this.getForm()
            .contains("Save")
            .should('be.enabled', { timeout: 5000 })
        return this;
    }

    static cancel() {
        this.getForm()
            .get('button')
            .contains("Cancel")
            .click();
        return this;
    }

    static close() {
        this.getForm()
        .get('.close-btn-wrap button')
        .click();
    }
}
