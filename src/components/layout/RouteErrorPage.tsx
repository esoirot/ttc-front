import { FormattedMessage } from "react-intl";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Shown by the router when a page throws while rendering, instead of a blank screen. */
export function RouteErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="w-full px-8 py-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            <FormattedMessage
              id="routeError.title"
              defaultMessage="Something went wrong"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="routeError.body"
              defaultMessage="This page failed to load. Reload it, or go back to the dashboard."
            />
          </p>
          <div className="flex gap-2">
            <Button onClick={() => void navigate(0)}>
              <FormattedMessage
                id="routeError.reload"
                defaultMessage="Reload"
              />
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <FormattedMessage
                  id="routeError.home"
                  defaultMessage="Back to dashboard"
                />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
