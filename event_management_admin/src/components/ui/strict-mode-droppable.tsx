import { Droppable, DroppableProps } from "react-beautiful-dnd";
import { useEffect, useState } from "react";

export function StrictModeDroppable(props: DroppableProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props} />;
}