import ballerina/time;

function idLookup(string id) returns string {
    return "TheJoshTruck";
}

function convertDate(string date) returns string {
    time:Utc|time:Error dateUtc = time:utcFromString(date);
    if dateUtc is time:Utc {
        return time:utcToString(dateUtc);
    } else {
        return "";
    }
}

function convertDatePatternTwo(string date) returns string {
    time:Utc|time:Error dateUtc = time:utcFromString(date);
    if dateUtc is time:Utc {
        return time:utcToString(dateUtc);
    } else {
        return "";
    }
}

function transform(InputMessage[] inputPayload) returns TransformedMessage {
    return {
        dtos: from InputMessage input in inputPayload
            select {
                data: {
                    MessageGuid: input.MessageProperties.MessageId,
                    ParentMessageGuid: input.MessageProperties.AuditId,
                    MessageContentType: input.MessageProperties.EventType,
                    MessageContent: {
                        Metrics: input.Content.Metrics,
                        TripInformation: {
                            TripName: input.Content.TripInformation?.TripName ?: "",
                            Move: input.Content.TripInformation?.Move ?: 0.0,
                            Leg: input.Content.TripInformation?.Leg ?: 0.0,
                            Stop: input.Content.TripInformation?.Stop ?: 0.0,
                            OrderHeader: input.Content.TripInformation?.OrderHeader ?: 0.0,
                            Assets: from var asst in input.Assets
                                select {
                                    Id: asst.Id,
                                    Type: asst.Type,
                                    Confirmed: asst.Confirmed ?: false
                                },
                            AdditionalDataElements: input.Content.TripInformation?.AdditionalDataElements != ()
                            ? input.Content.TripInformation?.AdditionalDataElements
                            : []
                        },
                        HeaderInformation: {
                            CreateDateUtc: input.Content.HeaderInformation.CreateDateUtc
                        },
                        AdditionalDataElements: input.Content?.AdditionalDataElements != ()
                            ? input.Content?.AdditionalDataElements
                            : []
                    }
                },
                'type: input.MessageProperties.EventType
            }
    }
    ;
}
