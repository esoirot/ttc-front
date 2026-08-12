import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { RateSheetRowProps } from "@/types/rate-sheets.types";
import { CURRENCY_SYMBOLS } from "@/constants/rates";

export function RateSheetRow({
  sheet,
  clientName,
  onEdit,
  onDelete,
}: RateSheetRowProps) {
  const sym = CURRENCY_SYMBOLS[sheet.currency] ?? sheet.currency;
  const priceDisplay = `${sheet.pricePerWord.toFixed(4)} ${sym}`;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{sheet.name}</span>
          <Badge variant="outline" className="text-xs font-mono">
            {sheet.sourceLanguage} → {sheet.targetLanguage}
          </Badge>
          {clientName && (
            <span className="text-xs text-muted-foreground">{clientName}</span>
          )}
          {sheet.isDefault && clientName && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
          {sheet.description && (
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              — {sheet.description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {priceDisplay}
        </span>
        <Badge variant="outline" className="text-xs font-mono">
          {sheet.currency}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs border-blue-600 dark:border-blue-400 text-foreground hover:bg-blue-500/30 hover:text-foreground dark:hover:bg-blue-400/30 dark:hover:text-foreground"
          onClick={onEdit}
        >
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
            >
              ✕
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete &ldquo;{sheet.name}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This rate sheet will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
