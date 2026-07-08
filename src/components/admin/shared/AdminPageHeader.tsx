interface AdminPageHeaderProps {
  title: string;
  total: number;
}

export function AdminPageHeader({ title, total }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h1 className="text-xl font-semibold flex-1">{title}</h1>
      <span className="text-sm text-muted-foreground">{total} total</span>
    </div>
  );
}
