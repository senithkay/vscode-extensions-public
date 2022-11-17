
function transform(InputMessage input) returns TransformedMessage => 
{
           'type: input.MessageProperties.EventType,
           data: {
               MessageGuid: input.MessageProperties.AuditId,
               ParentMessageGuid: input.MessageProperties.MessageId,
               MessageContentType: input.MessageProperties.EventType,
               MessageContent: {
                   FormId: "taskComplete." + input.FormId,
                   Content: [
                       input.Content.BillOfLading,
                       input.Content.Weight,
                       input.Content.Pieces,
                       input.Content.Seal,
                       input.Content.DroppedTrailer,
                       input.Content.CurrOrPickedTrailer
                   ],
                   Coordinates: {
                       Latitude: input.Content.Latitude,
                       Longitude: input.Content.Longitude
                   },
                   Assets: from var i in input.Assets
                       select {
                           Type: i.Type,
                           Id: i.Id,
                           Confirmed: i.Confirmed
                       },
                   CreateDate: input.CreateDate
               }
           }
       };
 
 
function dictionary_lookup(string i) returns string {
   return "TheJoshTruck";
}
