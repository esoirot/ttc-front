import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClientForm({
  form,
  onChange,
}: {
  form: Record<string, string>;
  onChange: (f: Record<string, string>) => void;
}) {
  const f = (k: string) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...form, [k]: e.target.value }),
  });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Label>Name *</Label>
        <Input className="mt-1" placeholder="Acme Corp" {...f("name")} />
      </div>
      <div>
        <Label>Email</Label>
        <Input className="mt-1" type="email" {...f("email")} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input className="mt-1" {...f("phone")} />
      </div>
      <div>
        <Label>Legal name</Label>
        <Input className="mt-1" {...f("legalName")} />
      </div>
      <div>
        <Label>VAT number</Label>
        <Input className="mt-1" {...f("vatNumber")} />
      </div>
      <div>
        <Label>Address</Label>
        <Input className="mt-1" {...f("address")} />
      </div>
      <div>
        <Label>City</Label>
        <Input className="mt-1" {...f("city")} />
      </div>
      <div>
        <Label>Country</Label>
        <Input className="mt-1" {...f("country")} />
      </div>
      <div>
        <Label>Postal code</Label>
        <Input className="mt-1" {...f("postalCode")} />
      </div>
    </div>
  );
}
