export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  projectId: number | null;
  timeEntryId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  userId: number;
  clientId: number | null;
  number: string;
  status: InvoiceStatus;
  currency: string;
  issuedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface InvoiceConnection {
  items: Invoice[];
  nextCursor: number | null;
  total: number;
}

export type InvoiceAddItemInput = {
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  projectId?: number;
  timeEntryId?: number;
};

export type InvoiceUpdateItemInput = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceEditState = { desc: string; qty: string; price: string };

export type InvoiceMetaUpdateInput = {
  clientId: number | null;
  currency: string;
  dueDate: string | null;
  notes: string | null;
};

export type InvoiceDetailHeaderProps = {
  number: string;
  status: InvoiceStatus;
  dueDate?: string | null;
  logoUrl?: string | null;
  downloading: boolean;
  onStatusChange: (next: InvoiceStatus) => void;
  onDownloadPdf: () => void;
  onDelete: () => void;
};

export type InvoiceItemRowProps = {
  item: InvoiceItem;
  editing: boolean;
  editState: InvoiceEditState;
  onStartEdit: () => void;
  onChangeDesc: (v: string) => void;
  onChangeQty: (v: string) => void;
  onChangePrice: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
};

export type InvoiceLineItemsProps = {
  invoiceId: number;
  items: InvoiceItem[];
  onAddItem: (input: InvoiceAddItemInput) => Promise<unknown>;
  onUpdateItem: (input: InvoiceUpdateItemInput) => Promise<unknown>;
  onRemoveItem: (id: number) => void;
  adding: boolean;
};

export type InvoiceListCardProps = {
  inv: Invoice;
  clientName?: string;
};

export type InvoiceMetaCardProps = {
  clientId: number | null;
  currency: string;
  dueDate: string | null;
  notes: string | null;
  onUpdate: (input: InvoiceMetaUpdateInput) => Promise<unknown>;
};

export type InvoiceSubtotalProps = {
  items: InvoiceItem[];
  currency: string;
};

export type AddItemDialogProps = {
  invoiceId: number;
  alreadyAddedEntryIds: Set<number>;
  onAdd: (input: InvoiceAddItemInput) => Promise<unknown>;
  adding: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type TimeEntriesTabProps = {
  invoiceId: number;
  alreadyAddedEntryIds: Set<number>;
  onAdd: (input: InvoiceAddItemInput) => Promise<unknown>;
  adding: boolean;
};

export type CustomLineAddItemInput = {
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type CustomLineTabProps = {
  invoiceId: number;
  onAdd: (input: CustomLineAddItemInput) => Promise<unknown>;
  adding: boolean;
};
