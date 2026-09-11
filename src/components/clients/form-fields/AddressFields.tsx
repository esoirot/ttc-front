import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AddressFieldsProps } from "@/types/clients.types";

export function AddressFields({
  address,
  addressLine2,
  city,
  country,
  state,
  postalCode,
  onChange,
  idPrefix = "addr",
}: AddressFieldsProps) {
  const intl = useIntl();
  return (
    <>
      <div className="col-span-2 flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-address`}>
          <FormattedMessage
            id="clients.addressFields.address"
            defaultMessage="Address"
          />
        </Label>
        <Input
          id={`${idPrefix}-address`}
          value={address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder={intl.formatMessage({
            id: "clients.addressFields.addressPlaceholder",
            defaultMessage: "123 Main St",
          })}
        />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-addressLine2`}>
          <FormattedMessage
            id="clients.addressFields.addressLine2"
            defaultMessage="Address line 2"
          />
        </Label>
        <Input
          id={`${idPrefix}-addressLine2`}
          value={addressLine2}
          onChange={(e) => onChange("addressLine2", e.target.value)}
          placeholder={intl.formatMessage({
            id: "clients.addressFields.addressLine2Placeholder",
            defaultMessage: "Suite 100",
          })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-city`}>
          <FormattedMessage
            id="clients.addressFields.city"
            defaultMessage="City"
          />
        </Label>
        <Input
          id={`${idPrefix}-city`}
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder={intl.formatMessage({
            id: "clients.addressFields.cityPlaceholder",
            defaultMessage: "Paris",
          })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-postalCode`}>
          <FormattedMessage
            id="clients.addressFields.postalCode"
            defaultMessage="Postal code"
          />
        </Label>
        <Input
          id={`${idPrefix}-postalCode`}
          value={postalCode}
          onChange={(e) => onChange("postalCode", e.target.value)}
          placeholder={intl.formatMessage({
            id: "clients.addressFields.postalCodePlaceholder",
            defaultMessage: "75001",
          })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-state`}>
          <FormattedMessage
            id="clients.addressFields.state"
            defaultMessage="State / Province"
          />
        </Label>
        <Input
          id={`${idPrefix}-state`}
          value={state}
          onChange={(e) => onChange("state", e.target.value)}
          placeholder={intl.formatMessage({
            id: "clients.addressFields.statePlaceholder",
            defaultMessage: "Quebec",
          })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-country`}>
          <FormattedMessage
            id="clients.addressFields.country"
            defaultMessage="Country"
          />
        </Label>
        <Input
          id={`${idPrefix}-country`}
          value={country}
          onChange={(e) => onChange("country", e.target.value)}
          placeholder={intl.formatMessage({
            id: "clients.addressFields.countryPlaceholder",
            defaultMessage: "France",
          })}
        />
      </div>
    </>
  );
}
