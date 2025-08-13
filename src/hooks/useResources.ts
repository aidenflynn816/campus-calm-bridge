import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Resource {
  id: string;
  counselor_id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'article' | 'pdf' | 'video' | 'image';
  category: string;
  tags: string[];
  featured: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
  counselor?: {
    full_name: string;
  };
}

export interface CreateResourceData {
  title: string;
  description?: string;
  content?: string;
  type: 'article' | 'pdf' | 'video' | 'image';
  category: string;
  tags: string[];
  featured: boolean;
  file?: File;
}

export const useResources = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select(`
            *,
            counselor:profiles!counselor_id(full_name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching resources:', error);
          throw error;
        }

        // Transform and type the data properly
        return (data || []).map(item => {
          let counselor = undefined;
          if (item.counselor && typeof item.counselor === 'object' && item.counselor !== null) {
            const counselorObj = item.counselor as any;
            if (counselorObj.full_name) {
              counselor = { full_name: counselorObj.full_name };
            }
          }
          return {
            ...item,
            counselor
          };
        }) as Resource[];
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          variant: "destructive",
          title: "Error fetching resources",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
  });

  const createResource = useMutation({
    mutationFn: async (data: CreateResourceData) => {
      let file_url: string | undefined;
      let file_name: string | undefined;
      let file_size: number | undefined;

      // Upload file if provided
      if (data.file) {
        const fileExt = data.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, data.file);

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(uploadData.path);

        file_url = urlData.publicUrl;
        file_name = data.file.name;
        file_size = data.file.size;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: resource, error } = await supabase
        .from('resources')
        .insert([
          {
            counselor_id: user.user.id,
            title: data.title,
            description: data.description,
            content: data.content,
            type: data.type,
            category: data.category,
            tags: data.tags,
            featured: data.featured,
            file_url,
            file_name,
            file_size,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return resource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: "Resource created",
        description: "Resource has been created successfully."
      });
    },
    onError: (error) => {
      console.error('Error creating resource:', error);
      toast({
        variant: "destructive",
        title: "Error creating resource",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    },
  });

  const updateResource = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateResourceData> }) => {
      let updateData: any = {
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        category: data.category,
        tags: data.tags,
        featured: data.featured,
      };

      // Handle file upload if new file provided
      if (data.file) {
        const fileExt = data.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, data.file);

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(uploadData.path);

        updateData.file_url = urlData.publicUrl;
        updateData.file_name = data.file.name;
        updateData.file_size = data.file.size;
      }

      const { data: resource, error } = await supabase
        .from('resources')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return resource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: "Resource updated",
        description: "Resource has been updated successfully."
      });
    },
    onError: (error) => {
      console.error('Error updating resource:', error);
      toast({
        variant: "destructive",
        title: "Error updating resource",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: "Resource deleted",
        description: "Resource has been deleted successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting resource:', error);
      toast({
        variant: "destructive",
        title: "Error deleting resource",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    },
  });

  return {
    resources,
    isLoading,
    error,
    createResource,
    updateResource,
    deleteResource,
  };
};