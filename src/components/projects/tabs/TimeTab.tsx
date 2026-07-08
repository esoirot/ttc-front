import { EntryList } from "@/components/time/lists/EntryList";
import { TimerSection } from "@/components/time/sections/TimerSection";
import type { TimeTabProps } from "@/types/shared-ui.types";

export function TimeTab({ list, timer }: TimeTabProps) {
  return (
    <>
      <TimerSection {...timer} />
      <EntryList {...list} />
    </>
  );
}
