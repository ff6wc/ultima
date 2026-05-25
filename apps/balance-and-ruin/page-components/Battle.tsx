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
      <GridItem size="full" className="h-full [&>*]:h-full">
        <Scaling />
      </GridItem>

      {/* Row 2: Bosses (Massive, make full-width!) */}
      <GridItem size="full" className="h-full [&>*]:h-full">
        <Bosses />
      </GridItem>

      {/* Row 3: Encounters (Short) & Experience/GP (Short) - share a row! */}
      <GridItem className="h-full [&>*]:h-full">
        <Encounters />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <ExperienceMagicPointsGold />
      </GridItem>
    </PageContainer>
  );
};
