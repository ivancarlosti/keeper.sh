import {
  CalendarSourcesSection,
  DestinationsSection,
  ICalLinkSection,
} from "@/components/integrations-sections";
import { PageContent } from "@/components/page-content";

export default function IntegrationsPage() {
  return (
    <PageContent>
      <CalendarSourcesSection />
      <DestinationsSection />
      <ICalLinkSection />
    </PageContent>
  );
}
