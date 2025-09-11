import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Clock, FlaskConical, Send } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MoodReminderSettings = () => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleToggleReminder = (enabled: boolean) => {
    updateProfile.mutate({ mood_reminder_enabled: enabled });
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test to.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('test-mood-reminder', {
        body: { testEmail }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent! ✅",
        description: `Test mood reminder sent to ${testEmail}`,
      });
      setTestEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Failed to Send Test",
        description: "There was an error sending the test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Reminder Toggle */}
      <div className="flex items-center justify-between p-4 border border-bridge-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-bridge-primary" />
          <div>
            <Label htmlFor="mood-reminder" className="text-base font-medium">
              Daily Mood Reminder
            </Label>
            <p className="text-sm text-bridge-text/70 mt-1">
              Get reminded at 9:30 PM Eastern if you haven't done your daily check-in
            </p>
          </div>
        </div>
        <Switch
          id="mood-reminder"
          checked={profile?.mood_reminder_enabled ?? true}
          onCheckedChange={handleToggleReminder}
          disabled={updateProfile.isPending}
        />
      </div>

      {/* How it works */}
      <Card className="bg-bridge-muted/10 border-bridge-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-bridge-primary mt-1" />
            <div>
              <h4 className="font-medium mb-2">How Daily Reminders Work</h4>
              <ul className="text-sm text-bridge-text/70 space-y-1">
                <li>• Emails are sent at 9:30 PM Eastern every day</li>
                <li>• Only sent if you haven't completed your mood check-in that day</li>
                <li>• Click the link in the email to go directly to your mood tracking page</li>
                <li>• You can disable reminders anytime using the toggle above</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <div className="p-4 border border-bridge-muted/30 rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
        <div className="flex items-start gap-3 mb-4">
          <FlaskConical className="w-5 h-5 text-orange-600 mt-1" />
          <div>
            <h4 className="font-medium text-orange-800 dark:text-orange-200">Test Email Reminder</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Send a test email to see what the daily mood reminder looks like
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter email address..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={sendTestEmail}
            disabled={isSendingTest || !testEmail}
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/50"
          >
            {isSendingTest ? (
              <>
                <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Test
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MoodReminderSettings;