import { ImageUploadExample } from "@/components/events/ImageUploadExample";

export default function DemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Image Upload Demo</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <ImageUploadExample />
      </div>
    </div>
  );
} 