import { ButtonLink, DiscordButton, Header } from "@ff6wc/ui";
import { openSans } from "~/pages/_app";
import { cva, cx } from "cva";
import type { GetStaticPropsContext, NextPage } from "next";
import { HiPencil, HiFlag } from "react-icons/hi";
import { WIKI_URL } from "@ff6wc/utils/constants";
import { AppLandingGridItem } from "~/components/AppLandingGridItem/AppLandingGridItem";
import { AppLandingSection } from "~/components/AppLandingSection/AppLandingSection";
import { HomeFooter } from "~/components/Footer/Footer";
import { SotwButton } from "~/components/SotwButton/SotwButton";
import { EventsButton } from "~/components/EventsButton/EventsButton";
import { CreateButton } from "~/components/CreateButton/CreateButton";
import { SpriteDrawAnimation } from "~/components/SpriteDrawAnimation/SpriteDrawAnimation";
import { AppHeader } from "~/components/AppHeader/AppHeader";
import Head from "next/head";

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {},
  };
}

const button = cva(["w-fit max-w-[500px] min-h-[70px] inline-flex"]);

export default function NewLandingPage() {
  return (
    <>
      <Head>
        <title>FF6 Worlds Collide</title>
        <meta
          name="description"
          content="Final Fantasy VI open-world randomizer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen bg-slate-950 text-white relative">
        <Header className="pb-16 pt-8 border-b border-white/10 shadow-2xl">
          <div className={cx(openSans.className, "max-w-4xl mx-auto text-center flex flex-col items-center px-8 mt-4")}>
            <div className="flex flex-col gap-6 text-lg lg:text-xl text-slate-100 max-w-3xl mx-auto font-medium" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}>
              <p>
                Worlds Collide (WC) is an open-world randomizer for Final Fantasy VI on the SNES. Players begin aboard the airship and can travel freely between the World of Balance and the World of Ruin to discover characters and espers. Once you&apos;ve gathered enough, you can face off against Kefka.
              </p>
              <p>
                Options within WC include options to randomize characters, commands, espers, treasure, shops and more with over 200 flags to customize each playthrough.
              </p>
            </div>
          </div>
        </Header>
        <main className={cx(openSans.className, "flex-grow")}>
        <AppLandingSection title={"Getting Started"}>
          <AppLandingGridItem
            className="lg:col-span-2"
            title={
              <>
                <SpriteDrawAnimation
                  delay={300}
                  spriteId={0}
                  paletteId={74}
                  poses={[1, 0, 1, 2]}
                />
                <span className="px-4">Randomizer</span>
              </>
            }
          >
            <div className="text-center">
              Generate a random seed and begin to play Worlds Collide
            </div>
            <CreateButton />
          </AppLandingGridItem>

          <AppLandingGridItem
            title={
              <>
                <SpriteDrawAnimation
                  delay={150}
                  spriteId={5}
                  paletteId={0}
                  poses={[16, 17]}
                />
                <span className="px-4">Discord</span>
              </>
            }
          >
            <div className="text-center">
              Join our Discord server to talk with the community and learn about
              the latest news and events
            </div>
            <div>
              <DiscordButton />
            </div>
          </AppLandingGridItem>

          <AppLandingGridItem
            title={
              <>
                <SpriteDrawAnimation
                  delay={150}
                  spriteId={21}
                  paletteId={3}
                  poses={[29, 30]}
                />
                <span className="px-4">Seed of the Week</span>
              </>
            }
          >
            <div className="text-center">
              Play a weekly seed submitted by a community member. You can post
              your time in the discord and see how you compare to others!
            </div>
            <SotwButton />
          </AppLandingGridItem>

          <AppLandingGridItem
            title={
              <>
                <SpriteDrawAnimation
                  delay={300}
                  spriteId={15}
                  paletteId={0}
                  poses={[25, 25, 26]}
                />
                <span className="px-4">Wiki</span>
              </>
            }
          >
            <div className="text-center">
              Visit the wiki for guides, resources, and how to get the most out
              of WC
            </div>

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
          </AppLandingGridItem>

          <AppLandingGridItem
            title={
              <>
                <SpriteDrawAnimation
                  delay={300}
                  spriteId={10}
                  paletteId={0}
                  poses={[1, 0, 1, 2]}
                />
                <span className="px-4">Events</span>
              </>
            }
          >
            <div className="text-center">
              Check out our ongoing community events and tournaments!
            </div>
            <EventsButton />
          </AppLandingGridItem>
        </AppLandingSection>
        </main>
        <HomeFooter />
      </div>
    </>
  );
}
