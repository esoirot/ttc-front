import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: "Molecules/Tabs",
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="ALL" className="w-80">
      <TabsList>
        <TabsTrigger value="ALL">All</TabsTrigger>
        <TabsTrigger value="ACTIVE">Active</TabsTrigger>
        <TabsTrigger value="DRAFT">Draft</TabsTrigger>
        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
      </TabsList>
      <TabsContent value="ALL">All projects.</TabsContent>
      <TabsContent value="ACTIVE">Active projects.</TabsContent>
      <TabsContent value="DRAFT">Draft projects.</TabsContent>
      <TabsContent value="COMPLETED">Completed projects.</TabsContent>
    </Tabs>
  ),
};

export const Line: Story = {
  render: () => (
    <Tabs defaultValue="ALL" className="w-80">
      <TabsList variant="line">
        <TabsTrigger value="ALL">All</TabsTrigger>
        <TabsTrigger value="ACTIVE">Active</TabsTrigger>
        <TabsTrigger value="DRAFT">Draft</TabsTrigger>
        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
      </TabsList>
      <TabsContent value="ALL">All projects.</TabsContent>
      <TabsContent value="ACTIVE">Active projects.</TabsContent>
      <TabsContent value="DRAFT">Draft projects.</TabsContent>
      <TabsContent value="COMPLETED">Completed projects.</TabsContent>
    </Tabs>
  ),
};
