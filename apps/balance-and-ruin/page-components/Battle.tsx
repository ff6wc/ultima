import { Bosses } from "~/card-components/Bosses";
import { Dragons } from "~/card-components/Dragons";
import { Encounters } from "~/card-components/Encounters";
import { ExperienceMagicPointsGold } from "~/card-components/ExperienceMagicPointsGold";
import { Scaling } from "~/card-components/Scaling";
import {
  GridItem,
  PageContainer,
} from "~/components/PageContainer/PageContainer";

export const Battle = () => {
  return (
    <PageContainer columns={2} className="!items-stretch">
      {/* Row 1: Scaling (Massive, make full-width so it becomes shallow!) */}
      <GridItem size="full" className="h-full [&>*]:h-full order-1 lg:order-1">
        <Scaling />
      </GridItem>

      {/* Row 2: Bosses (Massive, make full-width!) */}
      <GridItem size="full" className="h-full [&>*]:h-full order-3 lg:order-2">
        <Bosses />
      </GridItem>

      {/* Row 3: Encounters (Short) & Experience/GP (Short) - share a row! */}
      <GridItem className="h-full [&>*]:h-full order-4 lg:order-3">
        <Encounters />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full order-2 lg:order-4">
        <ExperienceMagicPointsGold />
      </GridItem>
    </PageContainer>
  );
};
