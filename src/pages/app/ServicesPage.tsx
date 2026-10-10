import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { SERVICE_CATALOG, SERVICE_CATEGORIES, type Service, type ServiceCategory } from '../../features/services/catalog';
import { ServiceCard } from '../../components/services/ServiceCard';
import { ServiceDetail } from '../../components/services/ServiceDetail';

export function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const servicesByCategory = Object.entries(SERVICE_CATEGORIES).map(([key, category]) => ({
    key: key as ServiceCategory,
    label: category.label,
    description: category.description,
    services: SERVICE_CATALOG.filter((s) => s.category === key),
  }));

  return (
    <div className="space-y-8">
      <PageTitle
        title="Services"
        description="Manage the capabilities available to your Corvanta workspace."
        icon={Sparkles}
      />

      <div className="space-y-8">
        {servicesByCategory.map(({ key, label, description, services }) => (
          <section key={key} aria-labelledby={`${key}-heading`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id={`${key}-heading`} className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                  {label}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ServiceDetail
        service={selectedService}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}