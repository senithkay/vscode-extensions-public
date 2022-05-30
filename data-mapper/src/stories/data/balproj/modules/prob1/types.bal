// input
type MessageProperties record {
    string EventType;
    string AuditId;
    string MessageId;
};

type AssetsItem record {
    int Type;
    string Id;
    boolean Confirmed = false;
};

type RecipientsItem record {
    string UserId;
    string|() EmailAddress;
    string Name;
};

type HeaderInformation record {
    string CreateDateUtc;
};

type Content record {
    string Message;
    RecipientsItem[] Recipients;
    HeaderInformation HeaderInformation;
    TripInformationIn|() TripInformation;
};

type TripInformationIn record {
    string TripName;
    decimal Move;
    decimal Leg;
    decimal Stop;
    decimal OrderHeader;
    record {|
        string Label;
        string Value;
    |}[] AdditionalDataElements = [];
};

type Input record {
    string ContentType;
    MessageProperties MessageProperties;
    AssetsItem[] Assets;
    Content Content;
    string CreateDate;
};


// Output
type RecipientsItemOut record {
    string UserId;
    string EmailAddress;
    string Name;
};

type HeaderInformationOut record {
    string CreateDateUtc;
};

type AssetsItemOut record {
    int Type;
    string Id;
    boolean Confirmed;
};

type TripInformation record {
    decimal OrderHeader;
    string TripName;
    decimal Move;
    decimal Stop;
    AssetsItemOut[] Assets;
    record {|
        string Label;
        string Value;
    |}[] AdditionalDataElements;
    decimal Leg;
};

type MessageContent record {
    string Message;
    RecipientsItemOut[] Recipients;
    HeaderInformationOut HeaderInformation;
    TripInformation TripInformation;
};

type Data record {
    string MessageContentType;
    MessageContent MessageContent;
    string ParentMessageGuid;
    string MessageGuid;
};

type DtosItem record {
    Data data;
    string 'type;
};

type Output record {
    DtosItem[] dtos;
};
