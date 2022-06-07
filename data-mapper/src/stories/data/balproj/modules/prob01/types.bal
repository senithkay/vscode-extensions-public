
type InputMessage record {
    record {
        string EventType;
        string AuditId;
        string MessageId;
    } MessageProperties;
    record {
        int Type;
        string Id;
        boolean Confirmed;
    }[] Assets;
    record {
        string StopId;
        string CurrOrPickedTrailer;
        string|() Driver2;
        string Driver1;
        decimal Latitude;
        string|() Unit;
        decimal Longitude;
        string TripId;
        string Weight;
        string BillOfLading;
        string ETA;
        decimal user_id;
        string DroppedTrailer;
        string Seal;
        record {
            string[] warnings;
            string[] errors;
        } form_meta;
        string Pieces;
    } Content;
    string FormId;
    string CreateDate;
};

 
// Output types
 
type TransformedMessage record {
    record {
        record {
            string MessageContentType;
            record {
                string[] Content;
                record {
                    int Type;
                    string Id;
                    boolean Confirmed;
                }[] Assets;
                record {
                    decimal Latitude;
                    decimal Longitude;
                } Coordinates;
                string FormId;
                string CreateDate;
            } MessageContent;
            string ParentMessageGuid;
            string MessageGuid;
        } data;
        string 'type;
    }[] dtos;
};
