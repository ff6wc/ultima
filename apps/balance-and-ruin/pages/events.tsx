import { useQuery } from "react-query";
import Head from "next/head";
import { cx } from "cva";
import { AppHeader } from "~/components/AppHeader/AppHeader";
import { HomeFooter } from "~/components/Footer/Footer";
import { EventCard } from "~/components/EventCard/EventCard";
import { EventData } from "~/types/events";
import { openSans } from "~/pages/_app";

import { parseCSV } from "~/utils/csvParser";
import { Disclosure, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi2";

const EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSZFZgv3BKozWuZeoHmfWQMFdQAYU-4FlxTLwf6sXFxyQBQRoCsmygcjn_9ErYllzBOx7VrzmTs9Sf/pub?output=csv";

export default function EventsPage() {
  const { data, isLoading, error } = useQuery<EventData[]>("events", async () => {
    const res = await fetch(`${EVENTS_CSV_URL}&t=${Date.now()}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const csvText = await res.text();
    const rawData = parseCSV(csvText);
    
    // Map CSV strings to EventData interface
    return rawData.map((row: any) => ({
      ...row,
      rules: row.rules ? row.rules.split("\n").filter((r: string) => r.trim()) : [],
    })) as EventData[];
  });

  const upcomingEvents = data?.filter((e) => e.status === "Upcoming") || [];
  const currentEvents = data?.filter((e) => e.status === "Current") || [];
  const archivedEvents = data?.filter((e) => e.status === "Archived") || [];

  const sections = [
    { title: "Upcoming Events", events: upcomingEvents, defaultOpen: true },
    { title: "Current Events", events: currentEvents, defaultOpen: true },
    { title: "Archived Events", events: archivedEvents, defaultOpen: false },
  ];

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
          <section className="relative py-12 px-8">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h1 className="text-7xl lg:text-9xl font-header main-header-text mb-4 uppercase tracking-wide">
                Community Events
              </h1>
              <div className="h-1 w-full max-w-[400px] bg-white mx-auto mb-8"></div>
              <div className="flex flex-col gap-6 text-lg lg:text-xl text-slate-100 max-w-3xl mx-auto font-medium">
                <p>
                  Test your mettle and pick up some new tricks along the way! Our events are a great place to sharpen your skills and meet the rest of the community.
                </p>
              </div>
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

                {data && (
                  <div className="flex flex-col gap-12">
                    {sections.map(
                      (section, idx) =>
                        section.events.length > 0 && (
                          <Disclosure key={idx} defaultOpen={section.defaultOpen}>
                            {({ open }) => (
                              <div className="flex flex-col gap-6">
                                <Disclosure.Button className="flex items-center justify-between w-full pb-4 border-b border-slate-800 hover:text-blue-400 transition-colors text-left">
                                  <h2 className="text-3xl font-header uppercase tracking-wider">
                                    {section.title}
                                    <span className="ml-4 text-sm font-mono text-slate-500 normal-case tracking-normal">
                                      ({section.events.length})
                                    </span>
                                  </h2>
                                  <HiChevronDown
                                    className={cx(
                                      "transition-transform duration-300",
                                      open ? "rotate-180" : ""
                                    )}
                                    size={24}
                                  />
                                </Disclosure.Button>

                                <Transition
                                  show={open}
                                  enter="transition duration-150 ease-out"
                                  enterFrom="transform opacity-0 -translate-y-4"
                                  enterTo="transform opacity-100 translate-y-0"
                                  leave="transition duration-100 ease-out"
                                  leaveFrom="transform opacity-100 translate-y-0"
                                  leaveTo="transform opacity-0 -translate-y-4"
                                >
                                  <Disclosure.Panel className="flex flex-col gap-4">
                                    {section.events.map((event) => (
                                      <EventCard key={event.id} event={event} />
                                    ))}
                                  </Disclosure.Panel>
                                </Transition>
                              </div>
                            )}
                          </Disclosure>
                        )
                    )}

                    {data.length === 0 && (
                      <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                        <p>No events found at the moment. Check back soon!</p>
                      </div>
                    )}
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
