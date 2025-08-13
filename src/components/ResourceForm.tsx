import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";
import { CreateResourceData, Resource } from "@/hooks/useResources";

interface ResourceFormProps {
  onSubmit: (data: CreateResourceData) => void;
  onCancel: () => void;
  initialData?: Resource;
  isLoading?: boolean;
}

const categories = [
  "Stress Management",
  "Wellness",
  "Mindfulness",
  "Anxiety",
  "Relationships",
  "Academic Success",
  "Adjustment",
  "Mental Health",
  "Self-Care",
  "Communication",
  "Life Skills"
];

const ResourceForm = ({ onSubmit, onCancel, initialData, isLoading }: ResourceFormProps) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateResourceData>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      type: initialData?.type || "article",
      category: initialData?.category || "",
      featured: initialData?.featured || false,
    }
  });

  const resourceType = watch("type");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const onFormSubmit = (data: CreateResourceData) => {
    onSubmit({
      ...data,
      tags,
      file: selectedFile || undefined,
    });
  };

  return (
    <Card className="bridge-card">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Resource" : "Create New Resource"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="bridge-input"
                placeholder="Enter resource title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={watch("type")} 
                onValueChange={(value) => setValue("type", value as any)}
              >
                <SelectTrigger className="bridge-input">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="pdf">PDF Guide</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={watch("category")} 
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger className="bridge-input">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="bridge-input"
              placeholder="Brief description of the resource"
              rows={3}
            />
          </div>

          {resourceType === "article" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...register("content")}
                className="bridge-input"
                placeholder="Full article content"
                rows={8}
              />
            </div>
          )}

          {(resourceType === "pdf" || resourceType === "video" || resourceType === "image") && (
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="bridge-input"
                  accept={
                    resourceType === "pdf" ? ".pdf" : 
                    resourceType === "video" ? "video/*" : 
                    "image/*"
                  }
                />
                {selectedFile && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Upload size={12} />
                    {selectedFile.name}
                  </Badge>
                )}
              </div>
              {initialData?.file_url && !selectedFile && (
                <p className="text-sm text-bridge-text/70">
                  Current file: {initialData.file_name}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="bridge-input flex-1"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    size={12} 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={watch("featured")}
              onCheckedChange={(checked) => setValue("featured", checked)}
            />
            <Label htmlFor="featured">Featured Resource</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Resource" : "Create Resource"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResourceForm;