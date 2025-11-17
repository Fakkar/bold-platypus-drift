import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type DescriptionDialogProps = {
  title: string;
  description: string;
  triggerLabel?: string;
};

const DescriptionDialog: React.FC<DescriptionDialogProps> = ({ title, description, triggerLabel = "مشاهده کامل" }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-primary underline hover:no-underline transition-colors"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-right text-sm leading-6 whitespace-pre-line text-muted-foreground">
          {description}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DescriptionDialog;