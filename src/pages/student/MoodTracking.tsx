
import { useState } from "react";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MoodTracking = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  
  // Mock data for mood history
  const moodHistory = [
    { id: 1, date: "2025-04-24", mood: "happy", note: "Had a good day today. Did well on my math test." },
    { id: 2, date: "2025-04-23", mood: "neutral", note: "Just an ordinary day, nothing special." },
    { id: 3, date: "2025-04-22", mood: "sad", note: "Feeling overwhelmed with assignments." },
    { id: 4, date: "2025-04-21", mood: "happy", note: "Spent time with friends, felt good." },
    { id: 5, date: "2025-04-20", mood: "happy", note: "Went for a long walk outside. Weather was nice." },
    { id: 6, date: "2025-04-19", mood: "neutral", note: "Studied most of the day." },
    { id: 7, date: "2025-04-18", mood: "sad", note: "Missed home today." },
  ];
  
  // Function to render mood emoji
  const renderMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "neutral":
        return "😐";
      case "sad":
        return "😔";
      default:
        return "❓";
    }
  };
  
  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error("Please select how you're feeling");
      return;
    }
    
    // Here we would normally send this data to the Supabase backend
    toast.success("Mood check-in recorded!");
    
    // Reset form
    setSelectedMood(null);
    setNote("");
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      weekday: 'short'
    });
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">Mood Tracking</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Keep track of how you're feeling
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Check-in */}
        <Card className="bridge-card">
          <CardHeader>
            <CardTitle>Today's Check-in</CardTitle>
            <CardDescription>How are you feeling today?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-6">
              <Button
                variant="outline"
                className={`rounded-2xl flex-1 mx-1 h-16 text-2xl ${
                  selectedMood === "happy" ? "bg-bridge-primary text-white hover:bg-bridge-primary" : ""
                }`}
                onClick={() => setSelectedMood("happy")}
              >
                😊
              </Button>
              <Button
                variant="outline"
                className={`rounded-2xl flex-1 mx-1 h-16 text-2xl ${
                  selectedMood === "neutral" ? "bg-bridge-primary text-white hover:bg-bridge-primary" : ""
                }`}
                onClick={() => setSelectedMood("neutral")}
              >
                😐
              </Button>
              <Button
                variant="outline"
                className={`rounded-2xl flex-1 mx-1 h-16 text-2xl ${
                  selectedMood === "sad" ? "bg-bridge-primary text-white hover:bg-bridge-primary" : ""
                }`}
                onClick={() => setSelectedMood("sad")}
              >
                😔
              </Button>
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-medium mb-1 block">Journal Note (Optional)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add some notes about how you're feeling..."
                className="bridge-input resize-none"
                rows={3}
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              className="bridge-button-primary w-full"
              disabled={!selectedMood}
            >
              Submit Check-in
            </Button>
          </CardContent>
        </Card>
        
        {/* Mood History */}
        <Card className="bridge-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Mood History</CardTitle>
            <CardDescription>Track your emotional patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-between mb-8">
              {moodHistory.slice(0, 14).map((day, index) => (
                <div key={index} className="flex flex-col items-center mb-4" style={{ width: '14.28%' }}>
                  <div className="text-2xl mb-1">{renderMoodEmoji(day.mood)}</div>
                  <div className="text-xs text-bridge-text/70 text-center">
                    {formatDate(day.date).split(' ')[0]}
                    <br />
                    {formatDate(day.date).split(' ')[1]}
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium mb-3">Recent Check-ins</h3>
            <div className="space-y-4">
              {moodHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl bg-bridge-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{renderMoodEmoji(entry.mood)}</span>
                      <span className="font-medium">
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm text-bridge-text/70">{formatDate(entry.date)}</span>
                  </div>
                  {entry.note && <p className="text-sm">{entry.note}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MoodTracking;
