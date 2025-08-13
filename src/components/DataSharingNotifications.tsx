import { useDataSharingRequests } from "@/hooks/useDataSharingRequests";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Shield, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DataSharingNotifications() {
  const { getPendingRequestsForStudent, respondToRequest } = useDataSharingRequests();
  const { toast } = useToast();

  const pendingRequests = getPendingRequestsForStudent();

  const handleResponse = async (requestId: string, status: 'approved' | 'denied') => {
    try {
      await respondToRequest(requestId, status);
      toast({
        title: status === 'approved' ? "Request approved" : "Request denied",
        description: `You have ${status} the counselor's request to access your mood data.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="h-5 w-5" />
          Data Sharing Requests
          <Badge variant="secondary" className="ml-auto">
            {pendingRequests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.map((request) => (
          <div key={request.id} className="flex items-start justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.counselor?.avatar_url} />
                <AvatarFallback>
                  {request.counselor?.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {request.counselor?.full_name || 'Counselor'}
                  </p>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(request.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  Wants to access your mood tracking data to better support you.
                </p>
                
                {request.message && (
                  <div className="bg-muted p-2 rounded text-sm mb-3">
                    <p className="font-medium mb-1">Message:</p>
                    <p>{request.message}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleResponse(request.id, 'approved')}
                    className="h-8"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(request.id, 'denied')}
                    className="h-8"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p className="font-medium mb-1">About data sharing:</p>
          <p>
            Approving this request allows your counselor to view your mood tracking data 
            to provide better support. You can revoke this access at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}