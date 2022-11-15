import { getCurrentProjectFolder } from "./file-utils";

const STORY_BOOK_BASE_URL = Cypress.env("storybookURL");
const APP_BASE_URL = Cypress.env("standaloneAppURL");


export function getBBEStoryURL(category, name) {
   return `${STORY_BOOK_BASE_URL}-testing-bbes-${category}--${name}`;
}

export function getIntegrationTestStoryURL(filePath) {
    return `${STORY_BOOK_BASE_URL}-integrationtest-project--${filePath.replaceAll("/", "-").replaceAll(".", "-")}`;
}

export function getIntegrationTestPageURL(filePath) {
    return `${APP_BASE_URL}?filePath=${encodeURIComponent(getCurrentProjectFolder() + "bal-project/" + filePath)}`;
}

export function getDevelopmentProjectStoryURL(filePath) {
    return `${STORY_BOOK_BASE_URL}-development-project--${filePath.replaceAll("/", "-").replaceAll(".", "-")}`;
}
 
