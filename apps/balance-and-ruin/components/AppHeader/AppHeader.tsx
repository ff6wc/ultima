import { ButtonLink, DiscordButton, Header } from "@ff6wc/ui";
import { HiPencil } from "react-icons/hi";
import { WIKI_URL } from "~/../../packages/utils/constants";
import { SotwButton } from "~/components/SotwButton/SotwButton";
import { EventsButton } from "~/components/EventsButton/EventsButton";
import { CreateButton } from "~/components/CreateButton/CreateButton";
import { useRouter } from "next/router";

export type AppHeaderProps = {
  hideNav?: boolean;
};

export const AppHeader = ({ hideNav }: AppHeaderProps) => {
  const router = useRouter();
  
  // Conditionally render the create button instead of the button for the current page
  const showCreateForEvents = router.pathname.startsWith('/events');
  const showCreateForSotw = router.pathname.startsWith('/sotw');

  return (
    <div>
      <Header className={"flex"}>
        {/* <div className="flex gap-3 flex-wrap justify-center"></div> */}
      </Header>
      {!hideNav && (
        <div className=".WC-nav flex flex-wrap justify-center items-center gap-4 p-5 bg-zinc-800">
          {showCreateForEvents && <CreateButton />}
          {showCreateForSotw && <CreateButton />}
          {!showCreateForEvents && <EventsButton />}
          {!showCreateForSotw && <SotwButton />}
          <ButtonLink
            className="w-fit max-w-[500px] min-h-[50px] inline-flex items-center gap-3"
            href={WIKI_URL}
            variant="primary"
          >
            <HiPencil size={28} className="text-white" />
            <div className="flex flex-col items-start">
              <div className="font-bold">Wiki</div>
            </div>
          </ButtonLink>
          <DiscordButton />
        </div>
      )}
    </div>
  );
};
