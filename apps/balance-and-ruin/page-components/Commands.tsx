import { Blitzes } from "~/card-components/Blitzes";
import { CommandsExcluded } from "~/card-components/CommandsExcluded";
import { CommandsList } from "~/card-components/CommandsList";
import { Dances } from "~/card-components/Dances";
import { Lores } from "~/card-components/Lores";
import { OtherCommands } from "~/card-components/OtherCommands";
import { Rages } from "~/card-components/Rages";
import { SketchControl } from "~/card-components/SketchControl";
import { StealCapture } from "~/card-components/StealCapture";
import { SwdTechs } from "~/card-components/SwdTechs";
import {
  GridItem,
  PageContainer,
} from "~/components/PageContainer/PageContainer";

export const Commands = () => {
  return (
    <PageContainer columns={3} className="!items-stretch">
      {/* Row 1: Main Commands List (Massive - Full Width!) */}
      <GridItem size="full" className="h-full [&>*]:h-full">
        <CommandsList />
      </GridItem>

      {/* Row 2: Excluded Commands (Dense - Full Width!) */}
      <GridItem size="full" className="h-full [&>*]:h-full">
        <CommandsExcluded />
      </GridItem>

      {/* Row 3: Dense Items Tiers */}
      <GridItem className="h-full [&>*]:h-full">
        <StealCapture />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <Lores />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <Dances />
      </GridItem>

      {/* Row 4: Short Items Tiers */}
      <GridItem className="h-full [&>*]:h-full">
        <Rages />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <Blitzes />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <SwdTechs />
      </GridItem>

      {/* Row 5: Final Short Items */}
      <GridItem className="h-full [&>*]:h-full">
        <SketchControl />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <OtherCommands />
      </GridItem>
    </PageContainer>
  );
};
