import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chests } from "~/card-components/Chests";
import { Coliseum } from "~/card-components/Coliseum";
import { EquipmentPermissions } from "~/card-components/EquipmentPermissions";
import { ItemRestrictions } from "~/card-components/ItemRestrictions";
import { OtherItems } from "~/card-components/OtherItems";
import { Shops } from "~/card-components/Shops";
import { StartingGoldAndItems } from "~/card-components/StartingGoldAndItems";
import { PageContainer } from "~/components/PageContainer/PageContainer";
import { selectStartingItems, setRawStartingItems } from "~/state/itemSlice";
import { selectRawFlags } from "~/state/flagSlice";

export const Items = () => {
  const items = useSelector(selectStartingItems);

  const dispatch = useDispatch();
  const rawFlags = useSelector(selectRawFlags);
  useEffect(() => {
    dispatch(setRawStartingItems(rawFlags));
  }, [dispatch]);
  return (
    <PageContainer columns={2}>
      <StartingGoldAndItems items={items} curateItems={true} />
      <Shops />
      <Chests />
      <EquipmentPermissions />
      <ItemRestrictions />
      <OtherItems />
    </PageContainer>
  );
};
