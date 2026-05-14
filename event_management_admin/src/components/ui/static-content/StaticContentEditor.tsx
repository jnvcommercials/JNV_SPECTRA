import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateStaticContent } from "@/api/staticContent";
import { Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface StaticContentEditorProps {
  contentType: string;
  initialContent: {
    id?: string;
    title: string;
    content: string;
    images: string[];
    section: string;
    meta_data?: {
      seo_title?: string;
      seo_description?: string;
      seo_keywords?: string;
    };
  };
}

const CONTENT_TYPES = [
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'contact', label: 'Contact' },
];

export function StaticContentEditor({ contentType, initialContent }: StaticContentEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState(contentType);
  
  // Ensure we have default values for all required fields
  const [content, setContent] = useState({
    title: initialContent.title || '',
    content: initialContent.content || '',
    images: [],
    section: selectedContentType,
    meta_data: {
      seo_title: initialContent.meta_data?.seo_title || '',
      seo_description: initialContent.meta_data?.seo_description || '',
      seo_keywords: initialContent.meta_data?.seo_keywords || '',
    }
  });

  const updateMutation = useUpdateStaticContent(selectedContentType);

  const handleTabChange = async (value: string) => {
    setIsLoading(true);
    try {
      // Only save if we have actual content to save
      if (content.title || content.content) {
        try {
          await updateMutation.mutateAsync(content);
        } catch (error) {
          console.error('Error saving content:', error);
          // Continue with tab switch even if save fails
        }
      }

      // Reset content for new type
      setSelectedContentType(value);
      setContent({
        title: '',
        content: '',
        images: [],
        section: value,
        meta_data: {
          seo_title: '',
          seo_description: '',
          seo_keywords: '',
        }
      });

      // Fetch new content
      try {
        const response = await fetchApi(`/api/v1/static-content/${value}`);
        if (response.data) {
          setContent({
            title: response.data.title || '',
            content: response.data.content || '',
            images: [],
            section: value,
            meta_data: {
              seo_title: response.data.meta_data?.seo_title || '',
              seo_description: response.data.meta_data?.seo_description || '',
              seo_keywords: response.data.meta_data?.seo_keywords || '',
            }
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error switching content type:', error);
      toast({
        title: "Error",
        description: "Failed to switch content type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(content);
      toast({
        title: "Content saved successfully",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to save content",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="p-6">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full" />
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Enter title"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content.content}
              onChange={(e) => setContent({ ...content, content: e.target.value })}
              placeholder="Enter content"
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-4">
            <Label>SEO Metadata</Label>
            <div className="space-y-2">
              <Input
                value={content.meta_data.seo_title}
                onChange={(e) => setContent({
                  ...content,
                  meta_data: { ...content.meta_data, seo_title: e.target.value }
                })}
                placeholder="SEO Title"
              />
              <Textarea
                value={content.meta_data.seo_description}
                onChange={(e) => setContent({
                  ...content,
                  meta_data: { ...content.meta_data, seo_description: e.target.value }
                })}
                placeholder="SEO Description"
              />
              <Input
                value={content.meta_data.seo_keywords}
                onChange={(e) => setContent({
                  ...content,
                  meta_data: { ...content.meta_data, seo_keywords: e.target.value }
                })}
                placeholder="SEO Keywords (comma separated)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedContentType} onValueChange={handleTabChange}>
        <TabsList>
          {CONTENT_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-6">
        {renderContent()}
      </Card>
    </div>
  );
}