import { useDispatch, useSelector } from "react-redux";
import { Chests } from "~/card-components/Chests";
import { Coliseum } from "~/card-components/Coliseum";
import { EquipmentPermissions } from "~/card-components/EquipmentPermissions";
import { ItemRestrictions } from "~/card-components/ItemRestrictions";
import { OtherItems } from "~/card-components/OtherItems";
import { Shops } from "~/card-components/Shops";
import { StartingGoldAndItems } from "~/card-components/StartingGoldAndItems";
import { PageContainer } from "~/components/PageContainer/PageContainer";
import { selectStartingItems } from "~/state/itemSlice";

export const Items = () => {
  const items = useSelector(selectStartingItems);
  
  return (
    <PageContainer columns={2}>
      <StartingGoldAndItems items={items} curateItems={true}/>
      <Shops />
      <Chests />
      <EquipmentPermissions />
      <ItemRestrictions />
      <OtherItems />
    </PageContainer>
  );
};
