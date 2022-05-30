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

function transform(InputMessage[] inputPayload) returns Output {
    return {
        dtos: from var input in inputPayload
            select {
                data: {
                    MessageGuid: input.MessageProperties.MessageId,
                    ParentMessageGuid: input.MessageProperties.AuditId,
                    MessageContentType: input.MessageProperties.EventType,
                    MessageContent: {
                        Metrics: input.Content.Metrics,
                        TripInformation: {
                            TripName: input.Content.TripInformation?.TripName,
                            Move: input.Content.TripInformation?.Move,
                            Leg: input.Content.TripInformation?.Leg,
                            Stop: input.Content.TripInformation?.Stop,
                            OrderHeader: input.Content.TripInformation?.OrderHeader,
                            Assets: from var asst in input.Assets
                                select {
                                    Id: idLookup(asst.Id),
                                    Type: asst.Type,
                                    Confirmed: asst.Confirmed
                                },
                            AdditionalDataElements: input.Content.TripInformation?.AdditionalDataElements != ()
                            ? <AdditionalDataElementsItem[]>input.Content.TripInformation?.AdditionalDataElements
                            : []
                        },
                        HeaderInformation: {
                            CreateDateUtc: convertDatePatternTwo(input.Content.HeaderInformation.CreateDateUtc)
                        },
                        AdditionalDataElements: input.Content?.AdditionalDataElements != ()
                            ? <AdditionalDataElementsItem[]>input.Content?.AdditionalDataElements
                            : []
                    }
                },
                'type: input.MessageProperties.EventType
            }
    }
    ;
}
