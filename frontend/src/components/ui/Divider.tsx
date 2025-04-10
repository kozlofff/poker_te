import * as React from "react"
import { cn } from "../game-logic/utils"

interface DividerProps extends React.ComponentProps<"div"> {
  orientation?: "vertical" | "horizontal";
}

export function Divider({ 
  className, 
  orientation = "vertical",
  ...props 
}: DividerProps) {
  return (
    <div
      data-slot="divider"
      className={cn(
        "bg-gray-800",
        orientation === "vertical" ? "w-px self-stretch mx-4" : "h-px w-full my-4",
        className
      )}
      {...props}
    />
  );
} 