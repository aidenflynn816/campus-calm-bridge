
import { useState } from "react";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, FileText, Video, Image, BookOpen } from "lucide-react";
import { useResources } from "@/hooks/useResources";
import { useAuth } from "@/contexts/AuthContext";
import ResourceForm from "@/components/ResourceForm";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  article: <BookOpen size={18} />,
  pdf: <FileText size={18} />,
  video: <Video size={18} />,
  image: <Image size={18} />,
};

const CounselorResources = () => {
  const { user } = useAuth();
  const { resources, isLoading, createResource, updateResource, deleteResource } = useResources();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  // Filter resources to show only those created by current counselor
  const counselorResources = resources.filter(resource => resource.counselor_id === user?.id);

  const handleCreateResource = (data: any) => {
    createResource.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      }
    });
  };

  const handleUpdateResource = (data: any) => {
    if (editingResource) {
      updateResource.mutate(
        { id: editingResource.id, data },
        {
          onSuccess: () => {
            setEditingResource(null);
          }
        }
      );
    }
  };

  const handleDeleteResource = (id: string) => {
    deleteResource.mutate(id);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bridge-primary mx-auto mb-4"></div>
            <p className="text-bridge-text/70">Loading resources...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Resources</h1>
            <p className="text-base text-muted-foreground mt-2">
              Manage wellness resources for students
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-bridge-primary hover:bg-bridge-primary/90">
                <Plus size={16} className="mr-2" />
                Create Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ResourceForm
                onSubmit={handleCreateResource}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={createResource.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {counselorResources.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="text-center py-16">
            <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No resources yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first resource to help students with wellness and mental health topics.
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-bridge-primary hover:bg-bridge-primary/90">
                  <Plus size={16} className="mr-2" />
                  Create First Resource
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselorResources.map((resource) => (
            <Card key={resource.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-bridge-primary">
                    {typeIcons[resource.type as keyof typeof typeIcons]}
                    <span className="text-xs uppercase font-medium">{resource.type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye size={14} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <div className="space-y-4">
                          <div>
                            <h2 className="text-xl font-bold">{resource.title}</h2>
                            <p className="text-sm text-bridge-text/70">{resource.category}</p>
                          </div>
                          {resource.description && (
                            <p className="text-bridge-text/80">{resource.description}</p>
                          )}
                          {resource.content && (
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap">{resource.content}</p>
                            </div>
                          )}
                          {resource.file_url && (
                            <div className="mt-4">
                              <a 
                                href={resource.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-bridge-primary hover:underline"
                              >
                                View {resource.type}: {resource.file_name}
                              </a>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog 
                      open={editingResource?.id === resource.id} 
                      onOpenChange={(open) => !open && setEditingResource(null)}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingResource(resource)}
                        >
                          <Edit size={14} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <ResourceForm
                          onSubmit={handleUpdateResource}
                          onCancel={() => setEditingResource(null)}
                          initialData={editingResource}
                          isLoading={updateResource.isPending}
                        />
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
                          <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteResource(resource.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2 line-clamp-2">{resource.title}</h3>
                <p className="text-sm text-bridge-text/70 mb-3 line-clamp-2">
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-bridge-text/60 mb-3">
                  <span>{resource.category}</span>
                  <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{resource.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                {resource.featured && (
                  <Badge className="bg-bridge-accent text-bridge-accent-foreground">
                    Featured
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default CounselorResources;
