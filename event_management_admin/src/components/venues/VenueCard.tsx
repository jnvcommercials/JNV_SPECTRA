import { MoreHorizontal, Edit, Trash2, Star, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Venue } from "@/pages/Venues";
import { cn } from "@/lib/utils";

interface VenueCardProps {
  venue: Venue;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VenueCard({ venue, onEdit, onDelete }: VenueCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden flex flex-col transition-all duration-300",
      "hover:shadow-lg hover:scale-[1.02]",
      "bg-gradient-to-br from-white to-gray-50"
    )}>
      <div className="relative aspect-video group">
        <img 
          src={venue.featured_image || "/placeholder.svg"} 
          alt={venue.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2">
          <Badge 
            variant={
              venue.status === "active" 
                ? "default" 
                : venue.status === "draft" 
                ? "outline" 
                : "secondary"
            }
            className="shadow-sm"
          >
            {venue.status}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <CardTitle className="text-xl font-semibold tracking-tight">{venue.title}</CardTitle>
            <CardDescription className="line-clamp-2">{venue.description}</CardDescription>
          </div>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="ml-1 text-sm font-medium">{venue.rating}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-sm text-primary">Location</div>
            <div className="col-span-2 text-sm text-muted-foreground">{venue.location}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-sm text-primary">Capacity</div>
            <div className="col-span-2 text-sm text-muted-foreground">{venue.capacity}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-sm text-primary">Type</div>
            <div className="col-span-2 text-sm text-muted-foreground">{venue.venue_type}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-sm text-primary">Space</div>
            <div className="col-span-2 text-sm text-muted-foreground">{venue.space_preference}</div>
          </div>
        </div>
        
        {venue.bullet_points && venue.bullet_points.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-primary">Features</p>
            <ul className="space-y-2">
              {venue.bullet_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{point.label}:</span> {point.value}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between border-t mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(venue.id)}
          className="hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          View Details
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(venue.id)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Venue
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(venue.id)}
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Venue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
} 