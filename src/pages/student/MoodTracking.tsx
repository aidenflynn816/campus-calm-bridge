import { useState } from "react";
import { format } from "date-fns";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMoodCheckins, MOOD_OPTIONS, DAILY_ISSUES, type CreateMoodCheckinData } from "@/hooks/useMoodCheckins";
import MoodChart from "@/components/MoodChart";
import IssuesChart from "@/components/IssuesChart";
import MoodReminderSettings from "@/components/MoodReminderSettings";

const MoodTracking = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [editingCheckin, setEditingCheckin] = useState<any>(null);
  
  const { 
    moodCheckins, 
    isLoading, 
    createMoodCheckin, 
    updateMoodCheckin, 
    deleteMoodCheckin, 
    todayCheckin,
    getMoodTrendData,
    getIssuesFrequencyData
  } = useMoodCheckins();

  const trendData = getMoodTrendData(30);
  const issuesData = getIssuesFrequencyData(30);

  const handleSubmitMood = () => {
    if (!selectedMood) return;

    const selectedOption = MOOD_OPTIONS.find(option => option.rating === selectedMood);
    if (!selectedOption) return;

    const data: CreateMoodCheckinData = {
      mood_rating: selectedMood,
      mood_emoji: selectedOption.emoji,
      notes: notes.trim() || undefined,
      daily_issues: selectedIssues,
    };

    createMoodCheckin.mutate(data, {
      onSuccess: () => {
        setSelectedMood(null);
        setNotes("");
        setSelectedIssues([]);
      }
    });
  };

  const handleUpdateMood = () => {
    if (!editingCheckin || !selectedMood) return;

    const selectedOption = MOOD_OPTIONS.find(option => option.rating === selectedMood);
    if (!selectedOption) return;

    const data = {
      mood_rating: selectedMood,
      mood_emoji: selectedOption.emoji,
      notes: notes.trim() || undefined,
      daily_issues: selectedIssues,
    };

    updateMoodCheckin.mutate(
      { id: editingCheckin.id, data },
      {
        onSuccess: () => {
          setEditingCheckin(null);
          setSelectedMood(null);
          setNotes("");
          setSelectedIssues([]);
        }
      }
    );
  };

  const handleEditCheckin = (checkin: any) => {
    setEditingCheckin(checkin);
    setSelectedMood(checkin.mood_rating);
    setNotes(checkin.notes || "");
    setSelectedIssues(checkin.daily_issues || []);
  };

  const handleDeleteCheckin = (id: string) => {
    deleteMoodCheckin.mutate(id);
  };


  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bridge-primary mx-auto mb-4"></div>
            <p className="text-bridge-text/70">Loading your mood data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-bridge-primary">Mood Check-in</h1>
          <p className="text-lg text-bridge-text/70 mt-1">
            Track your daily mood and reflect on your feelings
          </p>
        </div>

        {/* Today's Check-in */}
        <Card className="bridge-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              {todayCheckin ? "Today's Mood" : "How are you feeling today?"}
            </CardTitle>
            {todayCheckin && (
              <p className="text-sm text-bridge-text/70">
                Checked in at {format(new Date(todayCheckin.created_at), "h:mm a")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {todayCheckin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {(() => {
                    const moodOption = MOOD_OPTIONS.find(option => option.rating === todayCheckin.mood_rating);
                    return moodOption ? (
                      <div className={`p-4 rounded-xl ${moodOption.bgColor}/10 border-2 border-${moodOption.color.replace('text-', '')}/20`}>
                        <moodOption.icon size={48} className={moodOption.color} />
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <p className="text-lg font-medium">
                      {MOOD_OPTIONS.find(option => option.rating === todayCheckin.mood_rating)?.label}
                    </p>
                    {todayCheckin.notes && (
                      <p className="text-bridge-text/70 mt-1">{todayCheckin.notes}</p>
                    )}
                    {todayCheckin.daily_issues && todayCheckin.daily_issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-bridge-text/80 mb-1">Issues encountered:</p>
                        <div className="flex flex-wrap gap-1">
                          {todayCheckin.daily_issues.map((issueId) => {
                            const issue = DAILY_ISSUES.find(i => i.id === issueId);
                            return issue ? (
                              <Badge key={issueId} variant="secondary" className="text-xs">
                                {issue.label}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCheckin(todayCheckin)}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-bold mb-2">Edit Today's Mood</h2>
                          <p className="text-bridge-text/70">Update your mood and notes</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-3 block">How are you feeling?</label>
                            <div className="grid grid-cols-5 gap-3">
                              {MOOD_OPTIONS.map((option) => (
                                <Button
                                  key={option.rating}
                                  variant={selectedMood === option.rating ? "default" : "outline"}
                                  className={`h-16 flex flex-col gap-1 transition-all ${
                                    selectedMood === option.rating 
                                      ? `${option.bgColor} text-white hover:${option.bgColor}/90` 
                                      : `hover:${option.bgColor}/10 hover:border-${option.color.replace('text-', '')}/30`
                                  }`}
                                  onClick={() => setSelectedMood(option.rating)}
                                >
                                  <option.icon size={24} className={selectedMood === option.rating ? "text-white" : option.color} />
                                  <span className="text-xs">{option.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                            <Textarea
                              placeholder="How was your day? What influenced your mood?"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="bridge-input resize-none"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-3 block">Did you encounter any of these issues?</label>
                            <div className="grid grid-cols-1 gap-3">
                              {DAILY_ISSUES.map((issue) => (
                                <div key={issue.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-${issue.id}`}
                                    checked={selectedIssues.includes(issue.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedIssues([...selectedIssues, issue.id]);
                                      } else {
                                        setSelectedIssues(selectedIssues.filter(id => id !== issue.id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`edit-${issue.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {issue.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleUpdateMood}
                            disabled={!selectedMood || updateMoodCheckin.isPending}
                            className="bg-bridge-primary hover:bg-bridge-primary/90"
                          >
                            {updateMoodCheckin.isPending ? "Updating..." : "Update Mood"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setEditingCheckin(null);
                              setSelectedMood(null);
                              setNotes("");
                              setSelectedIssues([]);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">How are you feeling today?</label>
                  <div className="grid grid-cols-5 gap-3">
                    {MOOD_OPTIONS.map((option) => (
                      <Button
                        key={option.rating}
                        variant={selectedMood === option.rating ? "default" : "outline"}
                        className={`h-20 flex flex-col gap-2 transition-all ${
                          selectedMood === option.rating 
                            ? `${option.bgColor} text-white hover:${option.bgColor}/90` 
                            : `hover:${option.bgColor}/10 hover:border-${option.color.replace('text-', '')}/30`
                        }`}
                        onClick={() => setSelectedMood(option.rating)}
                      >
                        <option.icon size={28} className={selectedMood === option.rating ? "text-white" : option.color} />
                        <span className="text-xs text-center">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                  <Textarea
                    placeholder="How was your day? What influenced your mood?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bridge-input resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Did you encounter any of these issues today?</label>
                  <div className="grid grid-cols-1 gap-3">
                    {DAILY_ISSUES.map((issue) => (
                      <div key={issue.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={issue.id}
                          checked={selectedIssues.includes(issue.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIssues([...selectedIssues, issue.id]);
                            } else {
                              setSelectedIssues(selectedIssues.filter(id => id !== issue.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={issue.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {issue.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmitMood}
                  disabled={!selectedMood || createMoodCheckin.isPending}
                  className="bg-bridge-primary hover:bg-bridge-primary/90"
                >
                  {createMoodCheckin.isPending ? "Recording..." : "Record Mood"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Trend and History */}
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="bg-bridge-muted/30">
            <TabsTrigger value="trend">Mood Trend</TabsTrigger>
            <TabsTrigger value="issues">Issues Frequency</TabsTrigger>
            <TabsTrigger value="history">History Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trend">
            <MoodChart data={trendData} title="Your Mood Trend (Last 30 Days)" />
          </TabsContent>

          <TabsContent value="issues">
            <IssuesChart data={issuesData} title="Issues Frequency (Last 30 Days)" />
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="bridge-card">
              <CardHeader>
                <CardTitle>Mood History</CardTitle>
                <p className="text-sm text-bridge-text/70">
                  Your complete mood check-in log
                </p>
              </CardHeader>
              <CardContent>
                {moodCheckins.length === 0 ? (
                  <div className="text-center py-8 text-bridge-text/60">
                    <p>No mood check-ins yet.</p>
                    <p className="text-sm mt-1">Start by recording your first mood above!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moodCheckins.map((checkin) => (
                      <div key={checkin.id} className="border border-border rounded-lg p-4 hover:bg-bridge-muted/20 transition-colors">
                        <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {(() => {
                            const moodOption = MOOD_OPTIONS.find(option => option.rating === checkin.mood_rating);
                            return moodOption ? (
                              <div className={`p-3 rounded-lg ${moodOption.bgColor}/10 border border-${moodOption.color.replace('text-', '')}/20`}>
                                <moodOption.icon size={24} className={moodOption.color} />
                              </div>
                            ) : null;
                          })()}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {MOOD_OPTIONS.find(option => option.rating === checkin.mood_rating)?.label}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {checkin.mood_rating}/5
                              </Badge>
                            </div>
                              <div className="flex items-center gap-2 text-sm text-bridge-text/60 mb-2">
                                <Clock size={14} />
                                <span>{format(new Date(checkin.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                              </div>
                              {checkin.notes && (
                                <p className="text-bridge-text/80 text-sm">{checkin.notes}</p>
                              )}
                              {checkin.daily_issues && checkin.daily_issues.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-bridge-text/70 mb-1">Issues encountered:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {checkin.daily_issues.map((issueId) => {
                                      const issue = DAILY_ISSUES.find(i => i.id === issueId);
                                      return issue ? (
                                        <Badge key={issueId} variant="secondary" className="text-xs">
                                          {issue.label}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditCheckin(checkin)}
                                >
                                  <Edit size={14} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <div className="space-y-6">
                                  <div>
                                    <h2 className="text-xl font-bold mb-2">Edit Mood Check-in</h2>
                                    <p className="text-bridge-text/70">
                                      {format(new Date(checkin.created_at), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                  </div>
                                  
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium mb-3 block">Mood</label>
                                        <div className="grid grid-cols-5 gap-3">
                                          {MOOD_OPTIONS.map((option) => (
                                            <Button
                                              key={option.rating}
                                              variant={selectedMood === option.rating ? "default" : "outline"}
                                              className={`h-16 flex flex-col gap-1 transition-all ${
                                                selectedMood === option.rating 
                                                  ? `${option.bgColor} text-white hover:${option.bgColor}/90` 
                                                  : `hover:${option.bgColor}/10 hover:border-${option.color.replace('text-', '')}/30`
                                              }`}
                                              onClick={() => setSelectedMood(option.rating)}
                                            >
                                              <option.icon size={24} className={selectedMood === option.rating ? "text-white" : option.color} />
                                              <span className="text-xs">{option.label}</span>
                                            </Button>
                                          ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Notes</label>
                                      <Textarea
                                        placeholder="How was your day? What influenced your mood?"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="bridge-input resize-none"
                                        rows={3}
                                      />
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium mb-3 block">Did you encounter any of these issues?</label>
                                      <div className="grid grid-cols-1 gap-3">
                                        {DAILY_ISSUES.map((issue) => (
                                          <div key={issue.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`history-edit-${issue.id}`}
                                              checked={selectedIssues.includes(issue.id)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setSelectedIssues([...selectedIssues, issue.id]);
                                                } else {
                                                  setSelectedIssues(selectedIssues.filter(id => id !== issue.id));
                                                }
                                              }}
                                            />
                                            <label
                                              htmlFor={`history-edit-${issue.id}`}
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                              {issue.label}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={handleUpdateMood}
                                      disabled={!selectedMood || updateMoodCheckin.isPending}
                                      className="bg-bridge-primary hover:bg-bridge-primary/90"
                                    >
                                      {updateMoodCheckin.isPending ? "Updating..." : "Update"}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setEditingCheckin(null);
                                        setSelectedMood(null);
                                        setNotes("");
                                        setSelectedIssues([]);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 size={14} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Mood Check-in</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this mood check-in? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCheckin(checkin.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bridge-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Notification Settings
                </CardTitle>
                <p className="text-sm text-bridge-text/70">
                  Customize your mood tracking notifications
                </p>
              </CardHeader>
              <CardContent>
                <MoodReminderSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MoodTracking;