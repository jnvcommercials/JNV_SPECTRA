import { DragDropContext, Draggable, DroppableProvided, DroppableStateSnapshot } from "react-beautiful-dnd";
import { StrictModeDroppable } from "../strict-mode-droppable";
import { useState } from "react";

interface Slider {
  id: string;
  title: string;
  image: string;
}

export function Sliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sliders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSliders(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StrictModeDroppable droppableId="sliders">
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {sliders.map((slider, index) => (
              <Draggable key={slider.id} draggableId={slider.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 border rounded-lg"
                  >
                    <h3>{slider.title}</h3>
                    <img src={slider.image} alt={slider.title} className="w-full h-48 object-cover" />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
} 