import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Calendar, Check, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CalendlyUrlManagerProps {
  currentUrl?: string;
}

export const CalendlyUrlManager = ({ currentUrl }: CalendlyUrlManagerProps) => {
  const [url, setUrl] = useState(currentUrl || "");
  const [isEditing, setIsEditing] = useState(!currentUrl);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const validateCalendlyUrl = (url: string): boolean => {
    const calendlyRegex = /^https:\/\/calendly\.com\/[a-zA-Z0-9-_]+\/?.*$/;
    return calendlyRegex.test(url);
  };

  const updateCalendlyUrl = useMutation({
    mutationFn: async (newUrl: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ calendly_url: newUrl })
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Calendly URL updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Failed to update Calendly URL: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!url.trim()) {
      toast.error("Please enter a Calendly URL");
      return;
    }

    if (!validateCalendlyUrl(url)) {
      toast.error("Please enter a valid Calendly URL (e.g., https://calendly.com/your-name)");
      return;
    }

    updateCalendlyUrl.mutate(url);
  };

  const handleCancel = () => {
    setUrl(currentUrl || "");
    setIsEditing(false);
  };

  return (
    <Card className="bridge-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-bridge-primary" />
          <span>Calendly Integration</span>
        </CardTitle>
        <CardDescription>
          Connect your Calendly account to allow students to book appointments directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="calendly-url">Calendly URL</Label>
              <Input
                id="calendly-url"
                type="url"
                placeholder="https://calendly.com/your-name"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bridge-input"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter your personal Calendly URL. Students will use this to book appointments with you directly.
                Make sure your Calendly account is properly configured with your availability.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button 
                onClick={handleSave}
                disabled={updateCalendlyUrl.isPending}
                className="bridge-button-primary"
              >
                {updateCalendlyUrl.isPending ? "Saving..." : "Save URL"}
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={updateCalendlyUrl.isPending}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {currentUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-bridge-muted/20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Calendly Connected</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(currentUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-bridge-text/70 break-all bg-bridge-muted/10 p-2 rounded">
                  {currentUrl}
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit URL
                  </Button>
                  <Button
                    onClick={() => window.open(currentUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    Test Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 mx-auto text-bridge-text/50 mb-4" />
                <p className="text-bridge-text/70 mb-4">
                  No Calendly URL configured yet
                </p>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bridge-button-primary"
                >
                  Add Calendly URL
                </Button>
              </div>
            )}
          </>
        )}

        {!isEditing && !currentUrl && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Students won't be able to book appointments until you add your Calendly URL.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};