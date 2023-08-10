import { test, BrowserContext } from '@playwright/test';

export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('has title', async ({ browser, page }) => {
    wait(100000);
    const contexts = browser.contexts();
    console.log(contexts);
});
