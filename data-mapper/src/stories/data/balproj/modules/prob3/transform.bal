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

function transform(InputMessage input) returns TransformedMessage {
    return {
        dtos: [
            {
                'type: input.MessageProperties.EventType,
                data: {
                    MessageGuid: input.MessageProperties.MessageId,
                    ParentMessageGuid: input.MessageProperties.AuditId,
                    MessageContentType: input.MessageProperties.EventType,
                    MessageContent: {
                        Response: input.Content.Response,
                        RedispatchNow: input.Content.RedispatchNow.toBalString(),
                        Reason: input.Content.Reason,
                        TripInformation: {
                            TripName: input.Content?.TripInformation?.TripName != () ? <string>input.Content.TripInformation?.TripName : "",
                            Move: input.Content?.TripInformation?.Move != () ? <decimal>input.Content.TripInformation?.Move : 0,
                            Leg: input.Content?.TripInformation?.Leg != () ? <decimal>input.Content.TripInformation?.Leg : 0,
                            Stop: input.Content?.TripInformation?.Stop != () ? <decimal>input.Content.TripInformation?.Stop : 0,
                            OrderHeader: input.Content?.TripInformation?.OrderHeader != () ? <decimal>input.Content.TripInformation?.OrderHeader : 0,
                            Assets: from var asst in input.Assets
                                select {
                                    Id: idLookup(asst.Id),
                                    Type: asst.Type,
                                    Confirmed: asst.Confirmed != () ? <boolean>asst.Confirmed : false
                                },
                            AdditionalDataElements: input.Content.TripInformation?.AdditionalDataElements != ()
                            ? input.Content.TripInformation?.AdditionalDataElements
                            : []
                        },
                        HeaderInformation: {
                            CreateDateUtc: convertDatePatternTwo(input.Content.HeaderInformation.CreateDateUtc)
                        }
                    }
                }
            }
        ]
    };
}
