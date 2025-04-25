
import { useState } from "react";
import Layout from "../../components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileText, Video } from "lucide-react";

// Mock data for resources
const resourcesData = [
  {
    id: 1,
    title: "Managing Exam Stress",
    description: "Techniques to help you stay calm during exams",
    category: "Stress Management",
    type: "article",
    tags: ["Anxiety", "Academics", "Stress"],
    featured: true,
  },
  {
    id: 2,
    title: "Healthy Sleep Patterns",
    description: "How to establish a good sleep routine",
    category: "Wellness",
    type: "article",
    tags: ["Sleep", "Health", "Habits"],
    featured: true,
  },
  {
    id: 3,
    title: "Mindfulness Practice Guide",
    description: "Simple mindfulness exercises to try daily",
    category: "Mindfulness",
    type: "pdf",
    tags: ["Meditation", "Mental Health", "Wellness"],
    featured: false,
  },
  {
    id: 4,
    title: "Breathing Techniques for Anxiety",
    description: "Video tutorial on breathing exercises",
    category: "Anxiety",
    type: "video",
    tags: ["Anxiety", "Stress", "Techniques"],
    featured: false,
  },
  {
    id: 5,
    title: "Building Healthy Relationships",
    description: "Understanding boundaries and communication",
    category: "Relationships",
    type: "article",
    tags: ["Social", "Relationships", "Communication"],
    featured: false,
  },
  {
    id: 6,
    title: "Time Management Strategies",
    description: "Organize your schedule effectively",
    category: "Academic Success",
    type: "pdf",
    tags: ["Academics", "Organization", "Stress"],
    featured: true,
  },
  {
    id: 7,
    title: "Guided Meditation Session",
    description: "15-minute guided meditation for beginners",
    category: "Mindfulness",
    type: "video",
    tags: ["Meditation", "Relaxation", "Mental Health"],
    featured: false,
  },
  {
    id: 8,
    title: "Dealing with Homesickness",
    description: "Coping strategies for boarding school students",
    category: "Adjustment",
    type: "article",
    tags: ["Boarding School", "Emotions", "Coping"],
    featured: true,
  },
];

// All unique tags from resources
const allTags = Array.from(
  new Set(resourcesData.flatMap((resource) => resource.tags))
);

const typeIcons = {
  article: <BookOpen size={18} />,
  pdf: <FileText size={18} />,
  video: <Video size={18} />,
};

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Filter resources based on search query and selected tags
  const filteredResources = resourcesData.filter((resource) => {
    const matchesSearch = 
      searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some((tag) => resource.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Group resources by type for tabs
  const articles = filteredResources.filter((r) => r.type === "article");
  const pdfs = filteredResources.filter((r) => r.type === "pdf");
  const videos = filteredResources.filter((r) => r.type === "video");
  
  // Featured resources
  const featuredResources = resourcesData.filter((r) => r.featured);
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">Resources Library</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Browse wellness resources and guides
        </p>
      </div>
      
      {/* Search and filters */}
      <Card className="bridge-card mb-8">
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
          <h2 className="text-xl font-bold mb-4">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="bridge-card hover:shadow-medium transition-shadow">
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
        <TabsList className="mb-6 bg-bridge-muted/30">
          <TabsTrigger value="all">All ({filteredResources.length})</TabsTrigger>
          <TabsTrigger value="articles">Articles ({articles.length})</TabsTrigger>
          <TabsTrigger value="pdfs">PDF Guides ({pdfs.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
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
      </Tabs>
    </Layout>
  );
};

// Resource Card Component
interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
  featured: boolean;
}

const ResourceCard = ({ resource }: { resource: Resource }) => {
  return (
    <Card className="bridge-card hover:shadow-medium transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-bridge-primary">
            {typeIcons[resource.type as keyof typeof typeIcons]}
            <span className="text-xs uppercase font-medium">{resource.type}</span>
          </div>
          <span className="text-xs text-bridge-text/70">{resource.category}</span>
        </div>
        <h3 className="font-medium mb-2">{resource.title}</h3>
        <p className="text-sm text-bridge-text/70 mb-4">{resource.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Resources;
