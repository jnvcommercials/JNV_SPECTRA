import { DroppableProvided, DroppableStateSnapshot } from "react-beautiful-dnd";
import { ReactElement } from "react";

export interface StrictModeDroppableProps {
  droppableId: string;
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => ReactElement;
} 