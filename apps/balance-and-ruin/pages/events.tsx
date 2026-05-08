import { useQuery } from "react-query";
import Head from "next/head";
import { cx } from "cva";
import { AppHeader } from "~/components/AppHeader/AppHeader";
import { HomeFooter } from "~/components/Footer/Footer";
import { EventCard } from "~/components/EventCard/EventCard";
import { EventData } from "~/types/events";
import { openSans } from "~/pages/_app";

const EVENTS_JSON_URL = "https://raw.githubusercontent.com/ff6wc/ff6wc_events/main/events.json";

export default function EventsPage() {
  const { data, isLoading, error } = useQuery<EventData[]>("events", async () => {
    const res = await fetch(`${EVENTS_JSON_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  });

  return (
    <>
      <Head>
        <title>Events - FF6 Worlds Collide</title>
        <meta name="description" content="Highlighting community events and races for Final Fantasy VI Worlds Collide" />
      </Head>

      <div className="flex flex-col min-h-screen bg-slate-950 text-white">
        <AppHeader />
        
        <main className={cx(openSans.className, "flex-grow")}>
          {/* Hero Section */}
          <section className="relative py-20 px-8 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/hero_main.png')] bg-cover bg-center opacity-20 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950/50 to-slate-950 z-1"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-header main-header-text mb-4 uppercase tracking-tighter">
                Community Events
              </h1>
              <div className="h-1 w-24 bg-blue-500 mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
                Join the competition, test your skills, and participate in our upcoming races and challenges.
              </p>
            </div>
          </section>

          {/* Events List */}
          <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
              <>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-mono">Loading events...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center py-20 border-2 border-red-900 bg-red-950/20 rounded-lg">
                    <p className="text-red-400">Error loading events. Please try again later.</p>
                  </div>
                )}

                {data && data.length === 0 && (
                  <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                    <p>No events found at the moment. Check back soon!</p>
                  </div>
                )}

                {data && data.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {data.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </>
            </div>
          </section>
        </main>

        <HomeFooter />
      </div>
    </>
  );
}
