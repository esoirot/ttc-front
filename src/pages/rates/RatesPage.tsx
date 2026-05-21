import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRates } from "../../hooks/rates/useRates";
import { RateList } from "../../components/rates/RateList";
import { OverviewSection } from "../../components/rates/OverviewSection";

export function RatesPage() {
  const { rates: allRates, loading } = useRates();

  const hourly = allRates.filter((r) => r.type === "HOURLY");
  const perWord = allRates.filter((r) => r.type === "PER_WORD");
  const fixed = allRates.filter((r) => r.type === "FIXED");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Rates</h1>

      <Tabs defaultValue="overview">
        <div className="pb-4 border-b border-border mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hourly">
              Hourly
              {hourly.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                  {hourly.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="per-word">
              Per Word
              {perWord.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                  {perWord.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="fixed">
              Fixed Fee
              {fixed.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                  {fixed.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          {loading && allRates.length === 0 ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : allRates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No rates defined yet. Use the tabs above to add your first rate.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              <OverviewSection type="HOURLY" rates={hourly} loading={loading} />
              <OverviewSection
                type="PER_WORD"
                rates={perWord}
                loading={loading}
              />
              <OverviewSection type="FIXED" rates={fixed} loading={loading} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="hourly" className="mt-0">
          <RateList type="HOURLY" />
        </TabsContent>

        <TabsContent value="per-word" className="mt-0">
          <RateList type="PER_WORD" />
        </TabsContent>

        <TabsContent value="fixed" className="mt-0">
          <RateList type="FIXED" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
