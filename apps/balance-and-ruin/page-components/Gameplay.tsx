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
import { PageContainer } from "~/components/PageContainer/PageContainer";

export const Gameplay = () => {
  return (
    <PageContainer columns={3} className="!items-stretch">
      {/* Row 1: Game Mode, Movement, Challenges */}
      <div className="h-full [&>*]:h-full">
        <GameModeCard />
      </div>

      <div className="h-full [&>*]:h-full">
        <Movement />
      </div>

      <div className="h-full [&>*]:h-full">
        <Challenges />
      </div>

      {/* Row 2: Full width Coliseum */}
      <div className="col-span-full h-full [&>*]:h-full">
        <Coliseum />
      </div>

      {/* Row 3: Checks, Auction House, Other */}
      <div className="h-full [&>*]:h-full col-span-1">
        <Checks />
      </div>

      <div className="h-full [&>*]:h-full col-span-1">
        <AuctionHouse />
      </div>

      <div className="h-full [&>*]:h-full col-span-1">
        <MiscCard />
      </div>

      {/* Row 5: Bug Fixes, Boss Restoration, Accessibility */}
      <div className="h-full [&>*]:h-full">
        <BugFixes />
      </div>

      <div className="h-full [&>*]:h-full">
        <BossAI />
      </div>

      <div className="h-full [&>*]:h-full">
        <AccessibilityCard />
      </div>
    </PageContainer>
  );
};
