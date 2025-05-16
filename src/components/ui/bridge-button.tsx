
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BridgeButtonProps extends ButtonProps {
  loading?: boolean;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  rounded?: "default" | "full" | "lg";
  elevation?: "none" | "sm" | "md" | "lg";
}

const BridgeButton = React.forwardRef<HTMLButtonElement, BridgeButtonProps>(
  ({ 
    children, 
    className, 
    loading = false, 
    iconPosition = "left",
    fullWidth = false,
    rounded = "default",
    elevation = "none",
    disabled,
    ...props 
  }, ref) => {
    // Define dynamic classes based on props
    const roundedClasses = {
      default: "rounded-md",
      full: "rounded-full",
      lg: "rounded-xl"
    };
    
    const elevationClasses = {
      none: "",
      sm: "shadow hover:shadow-md",
      md: "shadow-md hover:shadow-lg",
      lg: "shadow-lg hover:shadow-xl"
    };
    
    return (
      <Button
        ref={ref}
        className={cn(
          "relative transition-all duration-200",
          iconPosition === "right" && "flex-row-reverse",
          fullWidth && "w-full",
          roundedClasses[rounded],
          elevationClasses[elevation],
          loading && "cursor-not-allowed",
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

BridgeButton.displayName = "BridgeButton";

export { BridgeButton };
