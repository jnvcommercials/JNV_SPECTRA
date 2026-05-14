import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Slide, useSliders } from "@/api/sliders";
import { useQueryClient } from "@tanstack/react-query";
import { SliderEditor } from "@/components/ui/sliders/SliderEditor";
import { SliderList } from "@/components/ui/sliders/SliderList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Image as ImageIcon } from "lucide-react";

const SLIDER_TYPES = [
  { value: "hero_slider", label: "Hero Slider" },
  { value: "featured_slider", label: "Featured Slider" },
];

export default function Sliders() {
  const [selectedSliderType, setSelectedSliderType] = useState("hero_slider");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch slides for the selected slider type
  const { data, isLoading } = useSliders(selectedSliderType, { 
    status: "active"
  });
  
  // Ensure slides is always an array
  const slides = Array.isArray(data) ? data : [];
  
  const handleSlideCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["sliders", selectedSliderType] });
    setShowCreateForm(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Slider Management</h1>
            <p className="text-muted-foreground mt-2">Manage your website sliders and featured content</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[200px]">
              <Select
                value={selectedSliderType}
                onValueChange={setSelectedSliderType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select slider type" />
                </SelectTrigger>
                <SelectContent>
                  {SLIDER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Slide
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          {showCreateForm && (
            <Card className="p-6 border-2 border-dashed border-primary/20">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Create New Slide</h2>
                  <p className="text-muted-foreground mt-1">Add a new slide to your {selectedSliderType.replace('_', ' ')}</p>
                </div>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
              <SliderEditor
                sliderType={selectedSliderType}
                onSlideCreated={handleSlideCreated}
                currentOrder={slides.length}
              />
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Current Slides</h2>
                <p className="text-muted-foreground mt-1">
                  {slides.length} {slides.length === 1 ? 'slide' : 'slides'} in your {selectedSliderType.replace('_', ' ')}
                </p>
              </div>
            </div>
            <SliderList
              slides={slides}
              isLoading={isLoading}
              onReorder={handleSlideCreated}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}