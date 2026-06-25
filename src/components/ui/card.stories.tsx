import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
  component: Card,
  title: "ui/Card",
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Acme Corp</CardTitle>
        <CardDescription>Translation client since 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          EN → FR · 12 active projects
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">View client</Button>
      </CardFooter>
    </Card>
  ),
};
