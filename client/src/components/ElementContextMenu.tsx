import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Copy,
  Clipboard,
  ClipboardCopy,
  Trash2,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  CopyPlus,
} from "lucide-react";

export interface ElementClipboard {
  element?: any;
  style?: Record<string, any>;
}

export interface ElementContextMenuProps {
  element: {
    id: string;
    type: string;
    data: any;
  };
  clipboard: ElementClipboard;
  onCopy: () => void;
  onCopyStyle: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLock: (locked: boolean) => void;
  onAlign: (alignment: "left" | "center" | "right") => void;
  onEditLink?: () => void;
  isLocked?: boolean;
}

export function ElementContextMenu({
  element,
  clipboard,
  onCopy,
  onCopyStyle,
  onPaste,
  onDuplicate,
  onDelete,
  onLock,
  onAlign,
  onEditLink,
  isLocked = false,
}: ElementContextMenuProps) {
  const [open, setOpen] = useState(false);

  const hasPasteContent = clipboard.element || clipboard.style;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 bg-slate-800 hover:bg-slate-700 text-white rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onCopy(); setOpen(false); }}
          className="cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
          <span className="ml-auto text-xs text-slate-400">Ctrl+C</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onCopyStyle(); setOpen(false); }}
          className="cursor-pointer"
        >
          <ClipboardCopy className="w-4 h-4 mr-2" />
          Copy style
          <span className="ml-auto text-xs text-slate-400">Ctrl+Alt+C</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onPaste(); setOpen(false); }}
          disabled={!hasPasteContent}
          className="cursor-pointer"
        >
          <Clipboard className="w-4 h-4 mr-2" />
          Paste
          <span className="ml-auto text-xs text-slate-400">Ctrl+V</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onDuplicate(); setOpen(false); }}
          className="cursor-pointer"
        >
          <CopyPlus className="w-4 h-4 mr-2" />
          Duplicate
          <span className="ml-auto text-xs text-slate-400">Ctrl+D</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
          <span className="ml-auto text-xs text-slate-400">DELETE</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            {isLocked ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
            Lock
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onLock(true); setOpen(false); }}
              className="cursor-pointer"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock element
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onLock(false); setOpen(false); }}
              className="cursor-pointer"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unlock element
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <AlignCenter className="w-4 h-4 mr-2" />
            Align to page
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onAlign("left"); setOpen(false); }}
              className="cursor-pointer"
            >
              <AlignLeft className="w-4 h-4 mr-2" />
              Align left
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onAlign("center"); setOpen(false); }}
              className="cursor-pointer"
            >
              <AlignCenter className="w-4 h-4 mr-2" />
              Align center
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onAlign("right"); setOpen(false); }}
              className="cursor-pointer"
            >
              <AlignRight className="w-4 h-4 mr-2" />
              Align right
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {onEditLink && (
          <>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onEditLink(); setOpen(false); }}
              className="cursor-pointer"
            >
              <Link className="w-4 h-4 mr-2" />
              Link
              <span className="ml-auto text-xs text-slate-400">Ctrl+K</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
