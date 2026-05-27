import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AddressFieldsProps } from "@/types/clients.types";

export function AddressFields({
  address,
  city,
  country,
  postalCode,
  onChange,
  idPrefix = "addr",
}: AddressFieldsProps) {
  return (
    <>
      <div className="col-span-2 flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-address`}>Address</Label>
        <Input
          id={`${idPrefix}-address`}
          value={address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="123 Main St"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-city`}>City</Label>
        <Input
          id={`${idPrefix}-city`}
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Paris"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-postalCode`}>Postal code</Label>
        <Input
          id={`${idPrefix}-postalCode`}
          value={postalCode}
          onChange={(e) => onChange("postalCode", e.target.value)}
          placeholder="75001"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-country`}>Country</Label>
        <Input
          id={`${idPrefix}-country`}
          value={country}
          onChange={(e) => onChange("country", e.target.value)}
          placeholder="France"
        />
      </div>
    </>
  );
}
