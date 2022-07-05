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
    string TripName;
    decimal Move;
    decimal Stop;
    record {|
        string Label;
        string Value;
    |}[]|() AdditionalDataElements;
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
    int Speed;
    string StatusDate;
    int Heading;
    string Description;
    Position Position;
    HeaderInformation HeaderInformation;
    decimal Odometer;
    record {|
        string Label;
        string Value;
    |}[]|() AdditionalDataElements;
    string IgnitionStatus;
    TripInformation|() TripInformation;
};

type Input record {
    string ContentType;
    MessageProperties MessageProperties;
    AssetsItem[] Assets;
    Content Content;
    string CreateDate;
};

type Position record {
    decimal Latitude;
    decimal Longitude;
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
    string|() Zip;
    int Speed;
    int Heading;
    string Description;
    Position Position;
    decimal Odometer;
    string|() City;
    string IgnitionStatus;
    string StatusDate;
    AssetsItemOut[] Assets;
    string|() State;
    HeaderInformation HeaderInformation;
    decimal|() Distance;
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

type Output record {
    DtosItem[] dtos;
};


