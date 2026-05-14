import { MoreHorizontal, Edit, Trash2, ChevronRight } from "lucide-react";
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
import { Rental } from "@/pages/Rentals";
import { cn } from "@/lib/utils";

interface RentalCardProps {
  rental: Rental;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RentalCard({ rental, onEdit, onDelete }: RentalCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden flex flex-col transition-all duration-300",
      "hover:shadow-lg hover:scale-[1.02]",
      "bg-gradient-to-br from-white to-gray-50"
    )}>
      <div className="relative aspect-video group">
        <img 
          src={rental.featured_image || "/placeholder.svg"} 
          alt={rental.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2">
          <Badge 
            variant={
              rental.status === "active" 
                ? "default" 
                : "secondary"
            }
            className="shadow-sm"
          >
            {rental.status}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold tracking-tight">{rental.title}</CardTitle>
        <CardDescription className="line-clamp-2">{rental.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        {rental.bullet_points && rental.bullet_points.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-primary">Features</p>
            <ul className="space-y-2">
              {rental.bullet_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{point.key}:</span> {point.value}
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
          onClick={() => onEdit(rental.id)}
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
            <DropdownMenuItem onClick={() => onEdit(rental.id)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Rental
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(rental.id)}
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Rental
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
