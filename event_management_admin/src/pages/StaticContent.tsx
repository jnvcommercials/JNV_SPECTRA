import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { StaticContentEditor } from "@/components/ui/static-content/StaticContentEditor";
import { fetchApi } from "@/lib/api";
import { getEmptyStaticContent } from "@/api/staticContent";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function StaticContent() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["staticContent", "privacy"],
    queryFn: async () => {
      const result = await fetchApi(`/api/v1/static-content/privacy`);
      const data = result.data || getEmptyStaticContent("privacy");
      return {
        ...data,
        images: data.images || [],
        metadata: data.metadata || {},
        status: data.status || 'active',
        order: data.order || 0
      };
    },
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">Static Content Management</h1>

        {isLoading ? (
          <Card className="p-6">
            <div className="text-center text-gray-500">Loading content...</div>
          </Card>
        ) : error ? (
          <Card className="p-6">
            <div className="text-center text-red-500">
              {error instanceof Error ? error.message : "Failed to load content"}
            </div>
          </Card>
        ) : (
          <StaticContentEditor
            contentType="privacy"
            initialContent={response}
          />
        )}
      </div>
    </DashboardLayout>
  );
}