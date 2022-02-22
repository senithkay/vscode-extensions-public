import { Function } from "./function";
import { Listener } from "./listener";
import { Record } from "./record";
import { Class } from "./class";
import { Other } from "./other";
import { Service } from "./service";

export class Canvas {

    // verify if welcome message is shown for the empty file.
    static welcomeMessageShouldBeVisible() {
        cy.get('#Get_started_by_selecting_Add_Constructor_here')
            .find('tspan')
            .should('have.text', 'Click here to get started.');
        return this;
    }

    static clickTopLevelPlusButton(targetLine: number = 0) {
        cy.get(`.plus-container[target-line="${targetLine}"] #Top_plus`)
            .click();
        return this;
    }

    private static getMemberContainerElementAt(startLine: number, startColumn: number, elementSelector: string = '') {
        return cy
            .get(`#canvas .member-container[data-start-position="${startLine}:${startColumn}"] ${elementSelector}`)
            .should('exist');
    }

    private static getListenerComponentELement(listenerName: string) {
        return cy.get(`#canvas .member-container .listener-comp[data-listener-name="${listenerName}"]`)
    }

    private static getRecordComponentELement(recordName: string) {
        return cy.get(`#canvas .member-container .record-comp[data-record-name="${recordName}"]`)
    }

    private static getFnMemberContainer(fnName: string) {
        return cy
            .get(`#canvas .member-container .module-level-function[data-function-name="${fnName}"]`)
            .should('exist');
    }

    private static waitForDiagramUpdate() {
        cy.get(`[id="canvas-overlay"]`)
            .children().should("have.length", 0)
        return this;
    }

    private static getClassMemberContainer(className: string) {
        return cy
            .get('#canvas .member-container .class-component .header-segment-path')
            .contains(className)
            .should('have.text', className)
            .parent()
            .parent()
            .parent();
    }

    private static getOtherMemberContainer() {
        return cy
            .get(`#getResponse`)
            .contains('Custom')
            .should('have.text', 'Custom')
            .parent()
            .parent()
            .parent();
    }

    private static getSvMemberContainer(svPath: string) {
        return cy
            .get(`#canvas .member-container .service .header-segment-path`)
            .contains(svPath)
            .should('have.text', svPath)
            .parent()
            .parent()
            .parent();
    }

    static getServiceAt(startLine: number, startColumn: number) {
        const element = this.getMemberContainerElementAt(startLine, startColumn, ".service");

    }

    static getFunction(fnName: string) {
        this.waitForDiagramUpdate()
        const element = this.getFnMemberContainer(fnName)
            ;
        return new Function(element);
    }

    static getService(fnName: string) {
        this.waitForDiagramUpdate()
        const element = this.getSvMemberContainer(fnName);
        return new Service(element);
    }

    static getListener(listenerName: string) {
        const element = this.getListenerComponentELement(listenerName);
        return new Listener(element);
    }

    static getRecord(recordName: string) {
        const element = this.getRecordComponentELement(recordName);
        return new Record(element);
    }

    static getClass(className: string) {
        return new Class(this.getClassMemberContainer(className));
    }

    static getOtherComponent() {
        return new Other(this.getOtherMemberContainer())
    }
}
