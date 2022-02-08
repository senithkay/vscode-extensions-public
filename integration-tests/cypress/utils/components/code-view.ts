export class SourceCode {
    
    static shouldBe(expectedContent: string) {
        return cy.get('#file-content-holder')
            .should('have.text', expectedContent)
    }

    static shouldBeEqualTo(expectedFile: string) {
        return cy.readFile(expectedFile).then((content) => {
            return SourceCode.shouldBe(content);
        })
    }

}
