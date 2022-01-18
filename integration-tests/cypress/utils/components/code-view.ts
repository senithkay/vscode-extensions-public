export class CodeView {
    
    static currentCodeShouldBe(expectedContent: string) {
        return cy.get('#file-content-holder')
            .should('have.text', expectedContent)
    }

    static currentCodeShouldBeEqualToFile(expectedFile: string) {
        return cy.readFile(expectedFile).then((content) => {
            return CodeView.currentCodeShouldBe(content);
        })
    }

}
