import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TwoFactorPromptCard() {
  return (
    <Card className="mb-6 max-w-sm border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          <FormattedMessage
            id="dashboard.twoFactorPrompt.title"
            defaultMessage="Secure your account"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="dashboard.twoFactorPrompt.body"
            defaultMessage="Two-factor authentication is not enabled."
          />
        </p>
        <Button asChild size="sm" className="self-start">
          <Link to="/settings/2fa">
            <FormattedMessage
              id="dashboard.twoFactorPrompt.cta"
              defaultMessage="Enable 2FA"
            />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
