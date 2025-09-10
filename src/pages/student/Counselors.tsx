import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar, User, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useCounselors } from "@/hooks/useCounselors";
import { useMyStudentsCounselors } from "@/hooks/useMyStudentsCounselors";

export default function StudentCounselors() {
  const navigate = useNavigate();
  const { counselors, isLoading } = useCounselors();
  const { hasRecentlyMessaged } = useMyStudentsCounselors();

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
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Counselors</h1>
          <p className="text-muted-foreground">
            Connect with our professional counselors for support and guidance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="text-center relative">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={counselor.avatar_url} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-xl">{counselor.full_name}</CardTitle>
                  {hasRecentlyMessaged(counselor.user_id) && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                      <Heart className="w-3 h-3 mr-1" />
                      My Counselor
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => openMessagePage(counselor.user_id)}
                    variant="outline" 
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    onClick={() => navigate('/student/book')}
                    className="flex-1"
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