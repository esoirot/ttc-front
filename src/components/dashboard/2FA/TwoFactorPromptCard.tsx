import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TwoFactorPromptCard() {
  return (
    <Card className="mb-6 max-w-sm border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Secure your account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Two-factor authentication is not enabled.
        </p>
        <Button asChild size="sm" className="self-start">
          <Link to="/settings/2fa">Enable 2FA</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
