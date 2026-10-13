/** Role as returned by GET /roles (company-scoped, public fields only). */
export interface RoleSummary {
  _id: string;
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
