export class SourceCode {
    
    static shouldBe(expectedContent: string) {
        return cy.get('#file-content-holder')
            .should('have.text', expectedContent)
    }

    static shouldHave(content: string) {
        return cy.get('#file-content-holder')
            .should('contain', content);
    }

    static shouldBeEqualTo(expectedFile: string) {
        return cy.readFile(expectedFile).then((content) => {
            return SourceCode.shouldBe(content);
        })
    }

    static waitForDiagramLoader() {
        cy.get('.loader-text');
        return cy.get('.loader-text').should('not.exist')
    }

}
