import { Disclosure, Transition } from "@headlessui/react";
import { Button, DiscordButton, Link } from "@ff6wc/ui";
import { cx } from "cva";
import { HiChevronDown, HiCalendar, HiLink, HiInformationCircle, HiUserGroup } from "react-icons/hi2";
import { EventData } from "~/types/events";

type Props = {
  event: EventData;
};

export const EventCard = ({ event }: Props) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <Disclosure>
        {({ open }) => (
          <div
            className={cx(
              "flex flex-col border-2 transition-all duration-300 overflow-hidden rounded-xl",
              "border-slate-700 bg-slate-900/50 backdrop-blur-sm",
              open ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "hover:border-slate-500"
            )}
          >
            <Disclosure.Button className="flex flex-col md:flex-row items-center justify-between p-6 text-left w-full gap-4">
              <div className="flex flex-col gap-2 flex-grow">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-header tracking-wide text-white uppercase">
                    {event.title}
                  </h2>
                  <span
                    className={cx(
                      "px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded",
                      event.status === "Current" ? "bg-green-600 text-white" : 
                      event.status === "Upcoming" ? "bg-blue-600 text-white" : 
                      "bg-slate-700 text-slate-300"
                    )}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <HiCalendar className="text-blue-400" />
                    <span>{event.date}</span>
                  </div>
                  {event.participants !== undefined && event.participants > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 mr-2">|</span>
                      <HiUserGroup className="text-blue-400" />
                      <span>{event.participants} Participants</span>
                    </div>
                  )}
                </div>
                <p className="text-slate-300 mt-1 line-clamp-2">
                  {event.shortDescription}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={cx(
                    "transition-transform duration-300",
                    open ? "rotate-180" : ""
                  )}
                >
                  <HiChevronDown size={28} className="text-slate-500" />
                </div>
              </div>
            </Disclosure.Button>

            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="px-6 pb-6 text-slate-300 border-t border-slate-800 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 flex flex-col gap-6">
                    {event.image && (
                        <div className="rounded-lg overflow-hidden border border-slate-700 max-w-md w-3/4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={event.image} alt={event.title} className="w-full h-auto object-cover" />
                        </div>
                    )}
                    <section>
                      <h3 className="flex items-center gap-2 text-white font-bold mb-3 text-lg">
                        <HiInformationCircle className="text-blue-400" />
                        About the Event
                      </h3>
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                        {event.description}
                      </p>
                    </section>

                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-white font-bold mb-1 text-lg">Quick Links</h3>
                    {event.signupLink ? (
                      <Link href={event.signupLink}>
                        <Button className="w-full justify-center font-bold h-12" variant="primary">
                          Sign Up Now
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full justify-center font-bold h-12" variant="default" disabled={true}>
                        Signups Closed
                      </Button>
                    )}
                    {event.rulesLink && (
                      <Link href={event.rulesLink}>
                        <Button className="w-full justify-center font-bold h-12" variant="outline">
                          Rules
                        </Button>
                      </Link>
                    )}

                    {event.discordLink && (
                      <DiscordButton href={event.discordLink} className="!w-full" />
                    )}
                  </div>
                </div>
              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </div>
  );
};
