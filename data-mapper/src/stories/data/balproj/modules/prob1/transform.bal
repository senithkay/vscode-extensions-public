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

function transform(Input input) returns Output {
    var {MessageProperties, Content, Assets} = input;
    var {Message, Recipients, HeaderInformation} = Content;
    var {EventType, MessageId, AuditId} = MessageProperties;
    return {
                'type: EventType,
                data: {
                    MessageContentType: EventType,
                    MessageContent: {
                        Message,
                        Recipients:
                            from var recipient
                                    in Recipients
                            select {
                                UserId: recipient.UserId,
                                Name: recipient.Name,
                                EmailAddress: recipient.EmailAddress != () ? <string>recipient.EmailAddress : ""
                            },
                        TripInformation: {
                            OrderHeader: Content.TripInformation != () ? <decimal>Content.TripInformation?.OrderHeader : 0.0,
                            Leg: Content.TripInformation != () ? <decimal>Content.TripInformation?.Leg : 0.0,
                            Move: Content.TripInformation != () ? <decimal>Content.TripInformation?.Move : 0.0,
                            Stop: Content.TripInformation != () ? <decimal>Content.TripInformation?.Stop : 0.0,
                            TripName: Content.TripInformation != () ? <string>Content.TripInformation?.TripName : "",
                            AdditionalDataElements: 
                                Content.TripInformation != () 
                                ? <record {| string Label; string Value; |}[]> Content.TripInformation?.AdditionalDataElements 
                                : [],
                            Assets:
                                from var {Type, Confirmed, Id} in Assets
                                select {
                                    Id: idLookup(Id),
                                    Type,
                                    Confirmed
                                }
                        },
                        HeaderInformation: {
                            CreateDateUtc: convertDate(HeaderInformation.CreateDateUtc)
                        }
                    },
                    ParentMessageGuid: AuditId,
                    MessageGuid: MessageId
                }
            };
}
