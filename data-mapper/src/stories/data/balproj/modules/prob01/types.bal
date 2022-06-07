// Input types
type Content record {
   string StopId;
   string CurrOrPickedTrailer;
   string Driver2;
   string Driver1;
   float Latitude;
   string Unit;
   float Longitude;
   string TripId;
   string Weight;
   string BillOfLading;
   string ETA;
   decimal user_id;
   string DroppedTrailer;
   string Seal;
   string Pieces;
   record {
       string[] errors;
       string[] warnings;
   } form_meta;
};
 
type Assets record {
   int Type;
   string Id;
   boolean Confirmed;
};
 
type MessageProperties record {
   string EventType;
   string AuditId;
   string MessageId;
};
 
type InputMessage record {
   Assets[] Assets;
   string FormId;
   string CreateDate;
   Content Content;
   MessageProperties MessageProperties;
};
 
// Output types
 
type Coordinates record {
   float Latitude;
   float Longitude;
};
 
type Asset record {
   int Type;
   string Id;
   boolean Confirmed;
};
 
type MessageContent record {
   string FormId;
   string[] Content;
   Coordinates Coordinates;
   Asset[] Assets;
   string CreateDate;
};
 
type Data record {
   string MessageGuid;
   string ParentMessageGuid;
   string MessageContentType;
   MessageContent MessageContent;
};
 
type dtos record {
   string 'type;
   Data data;
};
 
type TransformedMessage record {
   dtos[] dtos;
};