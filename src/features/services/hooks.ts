import { SERVICE_CATALOG, SERVICE_CATEGORIES, type Service, type ServiceCategory } from './catalog';

export function useServicesCatalog() {
  return {
    services: SERVICE_CATALOG,
  };
}

export function useService(id: string) {
  return SERVICE_CATALOG.find((s) => s.id === id);
}

export function useServicesByCategory() {
  return {
    services: SERVICE_CATALOG,
    categories: Object.entries(SERVICE_CATEGORIES).map(([key, category]) => ({
      key: key as ServiceCategory,
      label: category.label,
      description: category.description,
      services: SERVICE_CATALOG.filter((s) => s.category === key),
    })),
  };
}

export type { Service, ServiceCategory };