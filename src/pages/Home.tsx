import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectPublishedEvents } from "../features/events/eventSelectors";
import { fetchPublishedEvents } from "../features/events/eventsSlice";
import HeroSection from "../components/home/HeroSection";
import MarqueeBar from "../components/home/MarqueeBar";
import FeaturedEvents from "../components/home/FeaturedEvents";
import BenefitsSection from "../components/home/BenefitsSection";
import RecapSection from "../components/home/RecapSection";
import CtaSection from "../components/home/CtaSection";

export default function Home() {
  const dispatch = useAppDispatch();
  const publishedEvents = useAppSelector(selectPublishedEvents);

  useEffect(() => {
    void dispatch(fetchPublishedEvents());
  }, [dispatch]);

  const featuredEvents = publishedEvents.slice(0, 3);
  const popularEvents = publishedEvents.slice(3, 9);

  const cityCount = useMemo(
    () => new Set(publishedEvents.map((event) => event.city)).size,
    [publishedEvents],
  );
  const categoryCount = useMemo(
    () => new Set(publishedEvents.map((event) => event.category)).size,
    [publishedEvents],
  );

  const marqueeItems = useMemo(() => {
    const categories = [...new Set(publishedEvents.map((event) => event.category).filter(Boolean))];
    const cities = [...new Set(publishedEvents.map((event) => event.city).filter(Boolean))];
    const combined = [...categories, ...cities];
    return combined.length
      ? combined
      : ["Concerte", "Nightlife", "Festivaluri", "Expozitii", "Party", "Cultura", "Live music"];
  }, [publishedEvents]);

  return (
    <div className="section-stack">
      <HeroSection
        eventCount={publishedEvents.length}
        cityCount={cityCount}
        categoryCount={categoryCount}
        backgroundImage={featuredEvents[0]?.imageUrl}
      />

      <MarqueeBar items={marqueeItems} />

      <FeaturedEvents
        events={featuredEvents}
        eyebrow="Recomandari"
        title="Evenimente in prim-plan"
        ctaLabel="Vezi toate"
        ctaHref="/events"
      />

      <BenefitsSection />

      {popularEvents.length > 0 ? (
        <FeaturedEvents
          events={popularEvents}
          eyebrow="Pe val"
          title="Populare acum"
          ctaLabel="Exploreaza"
          ctaHref="/events"
        />
      ) : null}

      <RecapSection events={publishedEvents} />

      <CtaSection />
    </div>
  );
}
