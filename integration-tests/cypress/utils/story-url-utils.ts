const STORY_BOOK_BASE_URL = Cypress.env("storybookURL");

export function getBBEStoryURL(category, name) {
   return `${STORY_BOOK_BASE_URL}-testing-bbes-${category}--${name}`;
}

export function getIntegrationTestStoryURL(filePath) {
    return `${STORY_BOOK_BASE_URL}-integrationtest-project--${filePath.replaceAll("/", "-").replaceAll(".", "-")}`;
}

export function getDevelopmentProjectStoryURL(filePath) {
    return `${STORY_BOOK_BASE_URL}-development-project--${filePath.replaceAll("/", "-").replaceAll(".", "-")}`;
}
 
