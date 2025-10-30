
import { useState } from "react";
import Layout from "../../components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileText, Video, Image } from "lucide-react";

import { useResources } from "@/hooks/useResources";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  article: <BookOpen size={18} />,
  pdf: <FileText size={18} />,
  video: <Video size={18} />,
  image: <Image size={18} />,
};

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { resources, isLoading } = useResources();
  
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Get all unique tags from resources
  const allTags = Array.from(
    new Set(resources.flatMap((resource) => resource.tags))
  );
  
  // Filter resources based on search query and selected tags
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some((tag) => resource.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Group resources by type for tabs
  const articles = filteredResources.filter((r) => r.type === "article");
  const pdfs = filteredResources.filter((r) => r.type === "pdf");
  const videos = filteredResources.filter((r) => r.type === "video");
  const images = filteredResources.filter((r) => r.type === "image");
  
  // Featured resources
  const featuredResources = resources.filter((r) => r.featured);

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
      <div className="mb-8 pb-6 border-b border-border animate-fade-in">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Resources Library</h1>
        <p className="text-base text-muted-foreground mt-2">
          Browse wellness resources and guides
        </p>
      </div>
      
      {/* Search and filters */}
      <Card className="border shadow-sm mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-bridge-text/50" />
              <Input
                placeholder="Search resources..."
                className="bridge-input pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <p className="font-medium text-sm mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 6).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag) 
                        ? "bg-bridge-primary" 
                        : "hover:bg-bridge-accent/20"
                    }`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length > 6 && (
                  <Badge variant="outline" className="cursor-pointer hover:bg-bridge-accent/20">
                    +{allTags.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Featured resources */}
      {searchQuery === "" && selectedTags.length === 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center space-x-2 mb-2 text-bridge-primary">
                    {typeIcons[resource.type as keyof typeof typeIcons]}
                    <span className="text-xs uppercase font-medium">{resource.type}</span>
                  </div>
                  <h3 className="font-medium mb-2">{resource.title}</h3>
                  <p className="text-sm text-bridge-text/70 mb-3">{resource.description}</p>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {resource.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* All resources */}
      <Tabs defaultValue="all">
        <TabsList className="mb-6 bg-muted/50 p-1 h-auto rounded-xl shadow-sm">
          <TabsTrigger value="all">All ({filteredResources.length})</TabsTrigger>
          <TabsTrigger value="articles">Articles ({articles.length})</TabsTrigger>
          <TabsTrigger value="pdfs">PDF Guides ({pdfs.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
          <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          {filteredResources.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-bridge-text/70">No resources found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTags([]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="articles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          {articles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-bridge-text/70">No articles found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pdfs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfs.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          {pdfs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-bridge-text/70">No PDF guides found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          {videos.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-bridge-text/70">No videos found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="images">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          {images.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-bridge-text/70">No images found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

// Resource Card Component
import type { Resource } from "@/hooks/useResources";

const ResourceCard = ({ resource }: { resource: Resource }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bridge-card hover:shadow-medium transition-shadow cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-bridge-primary">
                {typeIcons[resource.type as keyof typeof typeIcons]}
                <span className="text-xs uppercase font-medium">{resource.type}</span>
              </div>
              <span className="text-xs text-bridge-text/70">{resource.category}</span>
            </div>
            <h3 className="font-medium mb-2 line-clamp-2">{resource.title}</h3>
            <p className="text-sm text-bridge-text/70 mb-4 line-clamp-2">{resource.description}</p>
            
            <div className="flex items-center justify-between text-xs text-bridge-text/60 mb-3">
              <span>By {resource.counselor?.full_name}</span>
              <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-auto">
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
              <Badge className="bg-bridge-accent text-bridge-accent-foreground mt-2">
                Featured
              </Badge>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">{resource.title}</h2>
            <div className="flex items-center gap-2 text-sm text-bridge-text/70 mt-1">
              <span>{resource.category}</span>
              <span>•</span>
              <span>By {resource.counselor?.full_name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
            </div>
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
            <div className="border rounded-lg p-4 bg-bridge-muted/20">
              <div className="flex items-center gap-2 mb-2">
                {typeIcons[resource.type as keyof typeof typeIcons]}
                <span className="font-medium">{resource.file_name}</span>
              </div>
              <a 
                href={resource.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-bridge-primary hover:underline inline-flex items-center gap-1"
              >
                View {resource.type}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
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
  );
};

export default Resources;
