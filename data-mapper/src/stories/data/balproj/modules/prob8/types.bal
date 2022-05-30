type MessageProperties record {
    string EventType;
    string AuditId;
    string MessageId;
};

type AssetsItem record {
    int Type;
    string Id;
    boolean Confirmed;
};

type Metrics record {
    decimal WorkDayDriveRemaining;
    decimal DayDrive;
    decimal CycleDutyRemaining;
    decimal WorkDayOnDutyRemaining;
    decimal DaySleeperBerth;
    decimal DayOnDuty;
    decimal DayOffDuty;
};

type HeaderInformation record {
    string CreateDateUtc;
};

type AdditionalDataElementsItem record {
    string Label;
    string Value;
};

type TripInformation record {
    decimal OrderHeader;
    string TripName;
    decimal Move;
    decimal Stop;
    AdditionalDataElementsItem[]|() AdditionalDataElements;
    AssetsItem[] Assets;
    decimal Leg;
};

type Content record {
    Metrics Metrics;
    HeaderInformation HeaderInformation;
    AdditionalDataElementsItem[]|() AdditionalDataElements;
    TripInformation TripInformation;
};

type InputMessage record {
    string ContentType;
    MessageProperties MessageProperties;
    AssetsItem[] Assets;
    Content Content;
    string CreateDate;
};

// Output
type TripInformationOut record {
    decimal OrderHeader;
    string TripName;
    decimal Move;
    decimal Stop;
    AssetsItem[] Assets;
    AdditionalDataElementsItem[] AdditionalDataElements;
    decimal Leg;
};

type MessageContent record {
    Metrics Metrics;
    HeaderInformation HeaderInformation;
    AdditionalDataElementsItem[] AdditionalDataElements;
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

