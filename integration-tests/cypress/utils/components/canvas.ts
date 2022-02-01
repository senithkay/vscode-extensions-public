import { Function } from "./function";
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

    private static getFnMemberContainer(fnName: string) {
        return cy
            .get(`#canvas .member-container .module-level-function[data-function-name="${fnName}"]`)
            .should('exist');
    }

    private static getSvMemberContainer(svPath: string) {
        return cy
            .get(`#canvas .member-container .service .header-segment-path`)
            .should('have.text', svPath);
    }

    static getServiceAt(startLine: number, startColumn: number) {
        const element = this.getMemberContainerElementAt(startLine, startColumn, ".service");

    }

    static getFunction(fnName: string) {
        const element = this.getFnMemberContainer(fnName);
        return new Function(element);
    }

    static getService(fnName: string) {
        const element = this.getSvMemberContainer(fnName);
        return new Service(element);
    }

}
