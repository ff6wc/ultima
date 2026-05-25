import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chests } from "~/card-components/Chests";
import { EquipmentPermissions } from "~/card-components/EquipmentPermissions";
import { ItemRestrictions } from "~/card-components/ItemRestrictions";
import { OtherItems } from "~/card-components/OtherItems";
import { Shops } from "~/card-components/Shops";
import { StartingGoldAndItems } from "~/card-components/StartingGoldAndItems";
import {
  GridItem,
  PageContainer,
} from "~/components/PageContainer/PageContainer";
import { selectStartingItems, setRawStartingItems } from "~/state/itemSlice";
import { selectRawFlags } from "~/state/flagSlice";

export const Items = () => {
  const items = useSelector(selectStartingItems);

  const dispatch = useDispatch();
  const rawFlags = useSelector(selectRawFlags);
  useEffect(() => {
    dispatch(setRawStartingItems(rawFlags));
  }, [dispatch, rawFlags]);
  return (
    <PageContainer columns={2} className="!items-stretch">
      {/* Row 1: Starting Gold/Items (Massive - Full Width!) */}
      <GridItem size="full" className="h-full [&>*]:h-full">
        <StartingGoldAndItems  items={items} curateItems={true} />
      </GridItem>

      {/* Row 2: Shops (Massive - Full Width!) */}
      <GridItem size="full" className="h-full [&>*]:h-full">
        <Shops />
      </GridItem>

      {/* Row 3: Equipment Permissions (Short) & Chests (Short) */}
      <GridItem className="h-full [&>*]:h-full">
        <EquipmentPermissions />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <Chests />
      </GridItem>

      {/* Row 4: Restrictions (Short) & Other (Short) */}
      <GridItem className="h-full [&>*]:h-full">
        <ItemRestrictions />
      </GridItem>

      <GridItem className="h-full [&>*]:h-full">
        <OtherItems />
      </GridItem>
    </PageContainer>
  );
};
