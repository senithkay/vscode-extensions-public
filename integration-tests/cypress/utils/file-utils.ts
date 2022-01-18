export const PROJECT_PATH = "bal-project/"

export function getCurrentSpecFolder() {
    const specFileNameSegments = Cypress.spec.name.split("/")
    const fileName = specFileNameSegments.at(specFileNameSegments.length - 1);
    return Cypress.spec.relative.replace(fileName, '');
}
