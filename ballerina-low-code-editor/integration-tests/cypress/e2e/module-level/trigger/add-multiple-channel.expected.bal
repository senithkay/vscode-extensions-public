import ballerinax/trigger.slack;
import ballerina/http;

configurable slack:ListenerConfig config = ?;

listener http:Listener httpListener = new (8090);
listener slack:Listener webhookListener = new (config, httpListener);

service slack:SlackEventsAppService on webhookListener {

    remote function onAppMention(slack:GenericEventWrapper payload) returns error? {
        //Not Implemented
    }
    remote function onAppRateLimited(slack:GenericEventWrapper payload) returns error? {
        //Not Implemented
    }
    remote function onAppUninstalled(slack:GenericEventWrapper payload) returns error? {
        //Not Implemented
    }
}

service slack:SlackEventsDndService on webhookListener {

    remote function onDndUpdated(slack:GenericEventWrapper payload) returns error? {
        //Not Implemented
    }
    remote function onDndUpdatedUser(slack:GenericEventWrapper payload) returns error? {
        //Not Implemented
    }
}

service /ignore on httpListener {
}
