import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import React, { ReactNode } from "react";

export default function SubmitButton({
  isPending,
  type,
  isPendingMesssage,
  cta,
  variant,
  size,
  classname,
  asChild,
}: {
  isPending?: boolean;
  type: "button" | "submit" | "reset" | undefined;
  isPendingMesssage?: string | undefined;
  cta: ReactNode;
  variant:
    | "link"
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | null
    | undefined;
  size:
    | "default"
    | "xs"
    | "sm"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg"
    | null
    | undefined;
  classname?: string;
  asChild?: boolean;
}) {
  return (
    <Button
      asChild={asChild}
      type={type}
      disabled={isPending}
      variant={variant}
      size={size}
      className={`${classname} duration-200 cursor-pointer`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" /> {isPendingMesssage}
        </>
      ) : (
        <>{cta}</>
      )}
    </Button>
  );
}
