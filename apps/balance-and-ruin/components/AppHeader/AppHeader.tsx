import { ButtonLink, DiscordButton, Header } from "@ff6wc/ui";
import { HiPencil } from "react-icons/hi";
import { WIKI_URL } from "~/../../packages/utils/constants";
import { SotwButton } from "~/components/SotwButton/SotwButton";
import { EventsButton } from "~/components/EventsButton/EventsButton";

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
      <div className=".WC-nav flex flex-wrap justify-center items-center gap-4 p-5 bg-zinc-800">
        <EventsButton />
        <SotwButton />
        <DiscordButton />
        <ButtonLink
          className="w-fit min-h-[70px]"
          href={WIKI_URL}
          variant="primary"
        >
          <HiPencil size="36" />
          Wiki
        </ButtonLink>
      </div>
    </div>
  );
};
