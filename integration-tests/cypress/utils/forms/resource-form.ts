import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";
import { methods } from "../type-utils";

export class ResourceForm {

    private static selector = '[data-testid="resource-form"]';
    private static clearStroke = '{selectall}{del}';

    static typePathName(pathName: string) {
        ExpressionEditor
            .getForField("resource-path", this.selector)
            .clear()
            .type(pathName);
        cy.wait(2000);
        return this;
    }

    static typeReturnValue(pathName: string) {
        ExpressionEditor
            .getForField("return-type", this.selector)
            .clear()
            .type(pathName);
        cy.wait(2000);
        return this;
    }

    static selectMethod(type: methods) {
        SelectDropDown
            .getForField("api-method", this.selector)
            .select(type);
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

    static selectAdvancedConfig() {
        this.getForm()
            .get('[data-testid="advanced-path-config"]')
            .click();
        return this;
    }

    static clickAddPathSegments() {
        this.getForm()
            .get('[data-testid="add-path-param-button"]')
            .click();
        return this;
    }

    static togglePayload() {
        this.getForm()
            .get('[data-testid="payload-switch-toggle"]')
            .click();
        return this;
    }

    static clickRequestCheckBox() {
        this.getForm()
            .get('[data-testid="select-request-btn"]')
            .click();
        return this;
    }

    static clickCallerCheckBox() {
        this.getForm()
            .get('[data-testid="select-caller-btn"]')
            .click();
        return this;
    }

    static typePayloadType(payloadType: string) {
        ExpressionEditor
            .getForField("Payload type", this.selector)
            .type(payloadType)
            // .suggestWidgetShouldBeVisible() //Need to fix this
            .waitForValidations()
            // .clickFirstSuggestion() //Need to fix this
            ;
        return this;
    }

    static typePayloadName(payloadName: string) {
        const clearKeyStroke = "{selectall}{del}";
        this.getForm()
            .get('[data-testid="api-extract-segment"]')
            .click()
            .type(clearKeyStroke)
            .type(payloadName);
        return this;
    }

    static clickAddQueryParam() {
        this.getForm()
            .get('[data-testid="add-query-param-button"]')
            .click();
        return this;
    }

    static clickQueryParam(param: string) {
        return this.clickParam(param);
    }

    static clickPathParam(param: string) {
        return this.clickParam(param);
    }

    static clickParam(param: string) {
        this.getForm()
            .get(`[data-testid=${param}-item]`)
            .click();
        return this;
    }

    static clickIsParam() {
        this.getForm()
            .get(`[data-testid="is-param-btn"`)
            .click();
        return this;
    }

    static typeQueryParamType(type: string) {
        ExpressionEditor
            .getForField("Type", this.selector)
            .clear()
            .type(type)
            // .suggestWidgetShouldBeVisible()
            .waitForValidations()
            // .clickFirstSuggestion() //Fix Suggestions
            .waitForValidations()
            ;
        return this;
    }

    static typePathParamType(type: string) {
        ExpressionEditor
            .getForField("Select type", this.selector)
            .clear()
            .type(type)
            // .suggestWidgetShouldBeVisible()
            .waitForValidations()
            // .clickFirstSuggestion() //Fix Suggestions
            .waitForValidations()
            ;
        return this;
    }

    static edit(param: string) {
        const clearKeyStroke = "{selectall}{del}";
        this.getForm()
            .get('[data-testid="api-path-segment"]')
            .click()
            .type(clearKeyStroke)
            .type(param)
            .get('[data-testid="path-segment-add-btn"]')
            .click();
        return this;
    }

    static addResourceParam(type: 'QUERY' | 'HEADER', paramType: string, paramName: string, defaultValue?: string) {
        this.getForm()
            .get('[data-test-id="param-add-button"]')
            .click();

        ExpressionEditor
            .getForField("param-type", this.selector)
            .clear()
            .type(paramType);
        cy.wait(2000);

        ExpressionEditor
            .getForField("param-name", this.selector)
            .clear()
            .type(paramName);
        cy.wait(2000);

        if (defaultValue && defaultValue.length > 0) {
            ExpressionEditor
                .getForField("param-default-val", this.selector)
                .clear()
                .type(defaultValue);

            cy.wait(2000);
        }

        this.getForm()
            .get('[data-testid="path-segment-add-btn"]')
            .click();
        return this;
    }

    static addPayload(paramType?: string, paramName?: string) {
        this.getForm()
            .get('[data-test-id="payload-add-button"]')
            .click();

        if (paramType && paramType.length > 0) {
            ExpressionEditor
                .getForField("param-type", this.selector)
                .clear()
                .type(paramType);
            cy.wait(2000)
        }

        if (paramName && paramName.length > 0) {
            ExpressionEditor
                .getForField("param-name", this.selector)
                .clear()
                .type(paramName);
            cy.wait(2000);
        }


        this.getForm()
            .get('[data-testid="path-segment-add-btn"]')
            .click();
        return this;
    }

    static typePathParam(param: string) {
        const clearKeyStroke = "{selectall}{del}";
        this.getForm()
            .get('[data-testid="api-path-segment"]')
            .click()
            .type(clearKeyStroke)
            .type(param)
        return this;
    }

    static addPathParam(param: string) {
        const clearKeyStroke = "{selectall}{del}";
        this.getForm()
            .get('[data-testid="api-path-segment"]')
            .click()
            .type(clearKeyStroke)
            .type(param)
            .get('[data-testid="path-segment-add-btn"]')
            .click();
        return this;
    }

    static savePathParamBtn() {
        this.getForm()
            .get('[data-testid="path-segment-add-btn"]')
            .click();
        return this;
    }

    static addQueryParam(param: string) {
        const clearKeyStroke = "{selectall}{del}";
        this.getForm()
            .get('[data-testid="api-query-param-name"]')
            .click()
            .type(clearKeyStroke)
            .type(param)
            .get('[data-testid="query-param-add-btn"]')
            .click();
        return this;
    }

    static removePathParam(param: string) {
        this.getForm()
            .get(`[data-testid=${param}-close-btn]`)
            .click();
        return this;
    }

    static removeQueryParam(param: string) {
        this.getForm()
            .get(`[data-testid=${param}-close-btn]`)
            .click();
        return this;
    }

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;

    }


}
