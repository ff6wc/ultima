import { AccessibilityCard } from "~/card-components/AccessibilityCard";
import { AuctionHouse } from "~/card-components/AuctionHouse";
import { BossAI } from "~/card-components/BossAI";
import { BugFixes } from "~/card-components/BugFixes";
import { Challenges } from "~/card-components/Challenges";
import { Checks } from "~/card-components/Checks";
import { Coliseum } from "~/card-components/Coliseum";
import { GameModeCard } from "~/card-components/GameModeCard";
import { MiscCard } from "~/card-components/MiscCard";
import { Movement } from "~/card-components/Movement";
import {
  GridItem,
  PageContainer,
} from "~/components/PageContainer/PageContainer";

export const Gameplay = () => {
  return (
    <PageContainer columns={3} className="!items-stretch">
      {/* Row 1: Game Mode, Movement, Challenges */}
      <GridItem className="h-full [&>*]:h-full">
        <GameModeCard />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <Movement />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <Challenges />
      </GridItem>

      {/* Row 2: Full width Coliseum */}
      <GridItem size="full" className="h-full [&>*]:h-full">
        <Coliseum />
      </GridItem>

      {/* Row 3: Checks, Auction House, Other */}
      <GridItem className="h-full [&>*]:h-full">
        <Checks />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <AuctionHouse />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <MiscCard />
      </GridItem>

      {/* Row 5: Bug Fixes, Boss Restoration, Accessibility */}
      <GridItem className="h-full [&>*]:h-full">
        <BugFixes />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <BossAI />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <AccessibilityCard />
      </GridItem>
    </PageContainer>
  );
};
