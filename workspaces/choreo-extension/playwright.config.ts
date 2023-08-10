import { defineConfig, devices } from '@playwright/test';
import { } from "@wso2-enterprise/cypress-vscode-runner";

export default defineConfig({
    // Look for test files in the "tests" directory, relative to this configuration file.
    testDir: 'src/tests/e2e-playwright',

    // Run all tests in parallel.
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code.
    forbidOnly: !!process.env.CI,

    // Retry on CI only.
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: 'html',

    use: {
        // Base URL to use in actions like `await page.goto('/')`.
        baseURL: '',

        // Collect trace when retrying the failed test.
        trace: 'on-first-retry',

        launchOptions: {
            args: [
                '--no-sandbox',
                '--enable-logging',
                '--log-level=0',
                '--log-file=/Users/kavith/git/ballerina-plugin-vscode/workspaces/choreo-extension/test-resources/settings/chromium-log',
                '--crash-reporter-directory=/Users/kavith/git/ballerina-plugin-vscode/workspaces/choreo-extension/test-resources/settings/crash-reports',
                '--enable-blink-features=ShadowDOMV0',
                '--disable-renderer-backgrounding',
                '--ignore-certificate-errors',
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
                '--autoplay-policy=no-user-gesture-required',
                '--disable-site-isolation-trials',
                '--disable-dev-shm-usage',
                '--disable-ipc-flooding-protection',
                '--enable-precise-memory-info'
            ],
            executablePath: '/Users/kavith/git/ballerina-plugin-vscode/workspaces/choreo-extension/test-resources/Visual Studio Code.app/Contents/MacOS/Electron'

        },
    },
    // Configure projects for major browsers.
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Run your local dev server before starting the tests.
    // webServer: {
    //     command: 'npm run start',
    //     url: 'http://127.0.0.1:3000',
    //     reuseExistingServer: !process.env.CI,
    // },
});
