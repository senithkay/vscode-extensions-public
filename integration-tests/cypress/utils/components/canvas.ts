export class DiagramCanvas {
    
    // verify if welcome message is shown for the empty file.
    static welcomeMessageShouldBeVisible() {
        cy.get('#Get_started_by_selecting_Add_Constructor_here')
            .find('tspan')
            .should('have.text', 'Click here to get started.');
    }

}
