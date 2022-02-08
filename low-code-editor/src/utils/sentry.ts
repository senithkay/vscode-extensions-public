import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
import { SentryConfig } from "../DiagramGenerator/vscode/Diagram";


// https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/

export const init = (config: SentryConfig) => {
    /* eslint no-underscore-dangle: 0 */
    const dsn = "https://ce32ebb21fbb4a5ca243cd7859887a6a@o1137178.ingest.sentry.io/6189513";
    const sentryEnv = "production";
    const sampleRate = 1;
    if (!dsn) return;
    try {
        Sentry.init({
            dsn,
            release: "rel-2",
            environment: sentryEnv || 'unknown',
            ignoreErrors: [],
            sampleRate,
            integrations: [new BrowserTracing()],
            tracesSampleRate: 1.0,
        });
    } catch (e) {
        // console.log(e);
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
