import type { ChannelType } from '../customers/types';

export type ChannelStatus = 'active' | 'inactive' | 'connecting' | 'error';

/** Channel as returned by GET /channels/ (credential-like keys are already stripped by the backend). */
export interface Channel {
  _id: string;
  companyId: string;
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  createdAt: string;
  updatedAt: string;
}

/** Admin view of a web chat widget, from GET/PUT /channels/:id/widget. */
export interface WidgetView {
  channelId: string;
  enabled: boolean;
  /** True only when the backend considers the widget able to answer visitors. */
  ready: boolean;
  /** Human-readable reasons the widget is not ready yet (empty when ready). */
  problems: string[];
  widget: {
    key: string | null;
    allowedOrigins: string[];
    agentId: string | null;
    agentName: string | null;
    agentStatus: string | null;
    title: string;
    welcomeMessage: string;
    color: string;
  };
  embedSnippet: string | null;
}

export interface WidgetSettingsInput {
  enabled?: boolean | undefined;
  allowedOrigins?: string[] | undefined;
  agentId?: string | null | undefined;
  title?: string | undefined;
  welcomeMessage?: string | undefined;
  color?: string | undefined;
  rotateKey?: boolean | undefined;
}
