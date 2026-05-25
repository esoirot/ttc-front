export type ClockifyWorkspace = {
  id: string;
  name: string;
  imageUrl: string;
  featureSubscriptionType: string | null;
};

export type ClockifyProject = {
  id: string;
  name: string;
  color: string;
  archived: boolean;
  clientId: string | null;
};

export type ClockifyTimeInterval = {
  start: string;
  end: string | null;
  duration: string | null;
};

export type ClockifyTimeEntry = {
  id: string;
  description: string | null;
  projectId: string | null;
  tagIds: string[] | null;
  timeInterval: ClockifyTimeInterval;
  workspaceId: string;
  billable: boolean;
};

export type ClockifyTag = {
  id: string;
  name: string;
  workspaceId: string;
  archived: boolean;
};

export type ClockifyStatus = {
  connected: boolean;
  workspaceId: string | null;
};

export type StartEntryInput = {
  description?: string;
  projectId?: string;
  tagIds?: string[];
  start?: string;
  billable?: boolean;
};

export type UpdateEntryInput = {
  entryId: string;
  start: string;
  end?: string;
  description?: string;
  projectId?: string | null;
  billable: boolean;
  tagIds: string[];
};
