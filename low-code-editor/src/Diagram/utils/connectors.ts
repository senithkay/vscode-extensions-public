import { tooltipMessages } from "../components/Portals/utils/constants"

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
