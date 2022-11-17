type MessageProperties record {
    string EventType;
    string AuditId;
    string MessageId;
};

type AssetsItem record {
    int Type;
    string Id;
    boolean Confirmed?;
};

type TripInformation record {
    decimal OrderHeader;
    string|() TripName;
    decimal|() Move;
    decimal|() Stop;
    record {|
        string Label;
        string Value;
    |}[]|() AdditionalDataElements;
    AssetsItem[] Assets;
    decimal Leg;
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
    int Response;
    boolean RedispatchNow;
    string Reason;
    HeaderInformation HeaderInformation;
    record {|
        string Label;
        string Value;
    |}[]|() AdditionalDataElements;
    TripInformation|() TripInformation;
};


type InputMessage record {
    string ContentType;
    MessageProperties MessageProperties;
    AssetsItem[] Assets;
    Content Content;
    string CreateDate;
};

// OUTPUTs

type AssetsItemOut record {
    int Type;
    string Id;
    boolean Confirmed;
};

type TripInformationOut record {
    decimal OrderHeader;
    string TripName;
    decimal Move;
    decimal Stop;
    AssetsItemOut[] Assets;
    record {|
        string Label;
        string Value;
    |}[]|() AdditionalDataElements;
    decimal Leg;
};

type MessageContent record {
    int Response;
    string RedispatchNow;
    string Reason;
    HeaderInformation HeaderInformation;
    TripInformationOut TripInformation;
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

type TransformedMessage record {
    DtosItem[] dtos;
};


