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

/** One credential field a messaging provider needs. Secret values are never returned, only a hint. */
export interface ConnectorField {
  name: string;
  label: string;
  secret: boolean;
  required: boolean;
  help: string;
  configured: boolean;
  /** The saved value for ordinary fields, or "••••1234" for secrets. */
  display: string | null;
}

/** Admin view of a messaging connection, from GET/PUT /channels/:id/connector. */
export interface ConnectorView {
  channelId: string;
  type: ChannelType;
  label: string;
  status: ChannelStatus;
  enabled: boolean;
  storageReady: boolean;
  credentialsSaved: boolean;
  /** True only when the provider accepted the saved credentials in a connection test. */
  verified: boolean;
  /** True only when everything needed to answer customers is in place. */
  ready: boolean;
  problems: string[];
  fields: ConnectorField[];
  webhook: { url: string | null; verifyToken: string | null; needsSigningSecret: boolean };
  settings: { agentId: string | null; agentName: string | null; agentStatus: string | null; aiReplies: boolean };
  lastTest: { ok: boolean; at: string; message: string } | null;
  /** Shown once, right after it is created or rotated. */
  revealed?: { signingSecret?: string | undefined } | undefined;
}

export interface ConnectorSaveInput {
  credentials?: Record<string, string> | undefined;
  agentId?: string | null | undefined;
  aiReplies?: boolean | undefined;
  enabled?: boolean | undefined;
}

/** Channel types that connect to an outside messaging provider (website chat has its own page). */
export const MESSAGING_TYPES = ['whatsapp', 'messenger', 'instagram', 'sms', 'email'] as const;
export type MessagingType = (typeof MESSAGING_TYPES)[number];
