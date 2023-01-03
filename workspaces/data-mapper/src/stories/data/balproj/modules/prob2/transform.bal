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

function transform(Input input) returns Output {
    return {
        dtos: [
            {
                'type: input.MessageProperties.EventType,
                data: {
                    MessageGuid: input.MessageProperties.MessageId,
                    ParentMessageGuid: input.MessageProperties.AuditId,
                    MessageContentType: input.MessageProperties.EventType,
                    MessageContent: {
                        Assets: [],
                        StatusDate: convertDate(input.Content.StatusDate),
                        Speed: input.Content.Speed,
                        Heading: input.Content.Heading,
                        Position: input.Content.Position,
                        Description: input.Content.Description,
                        IgnitionStatus: input.Content.IgnitionStatus,
                        Odometer: input.Content.Odometer,
                        Zip: (),
                        City: (),
                        State: (),
                        Distance: (),
                        TripInformation: {
                            TripName: input.Content.TripInformation != () ? <string>input.Content.TripInformation?.TripName : "",
                            Move: input.Content.TripInformation != () ? <decimal>input.Content.TripInformation?.Move : 0,
                            Leg: input.Content.TripInformation != () ? <decimal>input.Content.TripInformation?.Leg : 0,
                            Stop: input.Content.TripInformation != () ? <decimal>input.Content.TripInformation?.Stop : 0,
                            OrderHeader: input.Content.TripInformation != () ? <decimal>input.Content.TripInformation?.OrderHeader : 0,
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
