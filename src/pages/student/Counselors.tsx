import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar, User, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useCounselors } from "@/hooks/useCounselors";
import { useStudentCounselors } from "@/hooks/useStudentCounselors";

export default function StudentCounselors() {
  const navigate = useNavigate();
  const { counselors, isLoading } = useCounselors();
  const { isMyCounselor } = useStudentCounselors();

  const openMessagePage = (counselorId: string) => {
    navigate(`/student/messages?counselor=${counselorId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading counselors...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="pb-6 border-b border-border">
          <h1 className="text-4xl font-bold text-primary tracking-tight">Counselors</h1>
          <p className="text-base text-muted-foreground mt-2">
            Connect with our professional counselors for support and guidance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="text-center relative pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={counselor.avatar_url} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-10 h-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold">{counselor.full_name}</CardTitle>
                  {isMyCounselor(counselor.user_id) && (
                    <Badge variant="secondary" className="text-xs px-3 py-1 bg-primary text-primary-foreground border-0 shadow-sm">
                      <Heart className="w-3 h-3 mr-1.5 fill-current" />
                      My Counselor
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => openMessagePage(counselor.user_id)}
                    variant="outline" 
                    className="flex-1 font-medium"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    onClick={() => navigate('/student/book')}
                    className="flex-1 font-medium shadow-sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </Layout>
  );
}