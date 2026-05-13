import { Chests } from "~/card-components/Chests";
import { EquipmentPermissions } from "~/card-components/EquipmentPermissions";
import { ItemRestrictions } from "~/card-components/ItemRestrictions";
import { OtherItems } from "~/card-components/OtherItems";
import { Shops } from "~/card-components/Shops";
import { StartingGoldAndItems } from "~/card-components/StartingGoldAndItems";
import { PageContainer } from "~/components/PageContainer/PageContainer";

export const Items = () => {
  return (
    <PageContainer columns={2} className="!items-stretch">
      {/* Row 1: Shops (Massive - Full Width!) */}
      <div className="col-span-full h-full [&>*]:h-full">
        <Shops />
      </div>
      
      {/* Row 2: Equipment Permissions (Massive - Full Width!) */}
      <div className="col-span-full h-full [&>*]:h-full">
        <EquipmentPermissions />
      </div>

      {/* Row 3: Starting Gold (Short) & Chests (Short) */}
      <div className="h-full [&>*]:h-full">
        <StartingGoldAndItems />
      </div>
      
      <div className="h-full [&>*]:h-full">
        <Chests />
      </div>

      {/* Row 4: Restrictions (Short) & Other (Short) */}
      <div className="h-full [&>*]:h-full">
        <ItemRestrictions />
      </div>
      
      <div className="h-full [&>*]:h-full">
        <OtherItems />
      </div>
    </PageContainer>
  );
};
