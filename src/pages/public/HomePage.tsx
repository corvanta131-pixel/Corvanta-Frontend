import { PublicLayout } from '../../layouts';
import { Hero } from '../../components/common/Hero';
import { CoreCapabilities } from '../../components/common/CoreCapabilities';
import { HowItWorks } from '../../components/common/HowItWorks';
import { AIAgents } from '../../components/common/AIAgents';
import { KnowledgeWorkflows } from '../../components/common/KnowledgeWorkflows';
import { BusinessControl } from '../../components/common/BusinessControl';
import { FinalCTA } from '../../components/common/FinalCTA';

export function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <CoreCapabilities />
      <HowItWorks />
      <AIAgents />
      <KnowledgeWorkflows />
      <BusinessControl />
      <FinalCTA />
    </PublicLayout>
  );
}