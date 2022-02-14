import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
import { SentryConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export const init = (config: SentryConfig) => {
    // /* eslint no-underscore-dangle: 0 */
    const sampleRate = 1;
    if (!config.dsn) return;
    try {
        Sentry.init({
            dsn: config.dsn,
            release: config.release,
            environment: config.environment,
            ignoreErrors: [],
            sampleRate,
            integrations: [new BrowserTracing()],
            tracesSampleRate: 1.0,
        });
        Sentry.setContext("Correlation ID", { id : config.correlationID });
    } catch (e) {
        // tslint:disable: no-console
        console.error(e);
    }
};

export const setSentryUser = (user: Pick<Sentry.User, 'id'> | null) => {
    Sentry.configureScope((scope) => {
        scope.setUser(user);
    });
};

export const reportErrorWithScope = (error: any, extraInfo?: any) => {
    Sentry.withScope((scope) => {
        if (extraInfo) scope.setExtras(extraInfo);
        Sentry.captureException(error);
    });
};
