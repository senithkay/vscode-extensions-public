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
        ExpressionEditor
            .getForField("Listener Name", this.selector)
            .type(name)
            .waitForValidations();
        return this;
    }

    static clearListenername() {
        ExpressionEditor
            .getForField("Listener Name", this.selector)
            .clear();
        return this;
    }

    static clearPortValue() {
        ExpressionEditor
            .getForField("Listener Port", this.selector)
            .clear();
        return this;
    }

    static typeListenerPortValue(value: number) {
        ExpressionEditor
            .getForField("Listener Port", this.selector)
            .type(value.toString())
            .clearSuggestions()
            .waitForValidations();
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

    static cancel() {
        this.getForm()
            .get('button')
            .contains("Cancel")
            .click();
        return this;
    }
}
