import { ExpressionEditor } from "../components/expression-editor"

export class ServiceForm {

    private static selector = '[data-testid="service-config-form"]';

    static typeServicePath(svcPath: string) {
        ExpressionEditor
            .getForField("Service path", this.selector)
            .clear()
            .type(svcPath)
            .waitForValidations();
        return this;
    }

    static typeListenerPort(port: number) {
        ExpressionEditor
            .getForField("Listener Port", this.selector)
            .clear()
            .type(port.toString())
            .waitForValidations();
        return this;

    }
    
    static clickDefineListenerline() {
        this.getForm()
            .get("fieldset span")
            .contains("Define Inline")
            .click();
        return this;
    }

    static selectServiceType(type: string) {
        this.getForm()
            .get(`ul[data-testid="service-types-list"] h4`)
            .contains(type)
            .should("be.visible")
            .click();
        return this;
    }

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;

    }

    private static getForm() {
        return cy 
            .get(this.selector);

    }

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;

    }


}
