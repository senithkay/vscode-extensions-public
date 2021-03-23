import { tooltipMessages } from "../components/Portals/utils/constants"

// TODO Remove if not need.
export const tooltipConfigs: Record<any, string> = {
    HTTP: tooltipMessages.httpConnector,
    SMTP: tooltipMessages.smtpConnector,
    POP3: tooltipMessages.pop3Connector,
    IMAP: tooltipMessages.imapConnector,
    Slack: tooltipMessages.slackConnector,
    Twilio: tooltipMessages.twilioConnector,
    "Salesforce BaseClient": tooltipMessages.salesforceBase,
    "Salesforce BulkJob": tooltipMessages.salesforceBulk,
    GitHub: tooltipMessages.gitHubConnector,
    Gmail: tooltipMessages.gmailConnector,
    "Google Calendar": tooltipMessages.gCalendarConnector,
    "Google Sheets": tooltipMessages.gSheetConnector
};

export const tooltipTitles: Record<any, string> = {
    HTTP: tooltipMessages.httpConnector.title,
    SMTP: tooltipMessages.smtpConnector.title,
    POP3: tooltipMessages.pop3Connector.title,
    IMAP: tooltipMessages.imapConnector.title,
    TWILIO: tooltipMessages.twilioConnector.title,
    GITHUB: tooltipMessages.gitHubConnector.title,
    GMAIL: tooltipMessages.gmailConnector.title,
    "GOOGLE CALENDAR": tooltipMessages.gCalendarConnector.title,
    "GOOGLE SHEETS": tooltipMessages.gSheetConnector.title,
    "SALESFORCE BASECLIENT": tooltipMessages.salesforceBase,
    "SALESFORCE BULKJOB": tooltipMessages.salesforceBulk,
    SLACK: tooltipMessages.slackConnector,
    SALESFORCE : tooltipMessages.salesforce.title,
    POSTGRESQL : tooltipMessages.postgreSQL.title,
    NETSUITE : tooltipMessages.netsuite.title,
};

export const tooltipExamples: Record<any, string> = {
    HTTP: tooltipMessages.httpConnector.content,
    SMTP: tooltipMessages.smtpConnector.content,
    POP3: tooltipMessages.pop3Connector.content,
    IMAP: tooltipMessages.imapConnector.content,
    TWILIO: tooltipMessages.twilioConnector.content,
    GITHUB: tooltipMessages.gitHubConnector.content,
    GMAIL: tooltipMessages.gmailConnector.content,
    "GOOGLE CALENDAR": tooltipMessages.gCalendarConnector.content,
    "GOOGLE SHEETS": tooltipMessages.gSheetConnector.content,
    "SALESFORCE BASECLIENT": tooltipMessages.salesforceBase,
    "SALESFORCE BULKJOB": tooltipMessages.salesforceBulk,
    SLACK: tooltipMessages.slackConnector,
    SALESFORCE : tooltipMessages.salesforce.content,
    POSTGRESQL : tooltipMessages.postgreSQL.content,
    NETSUITE : tooltipMessages.netsuite.content,
};

