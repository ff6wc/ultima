import { PageContainer } from "~/components/PageContainer/PageContainer";
import { InGameConfigCard } from "~/card-components/InGameConfigCard";
import { FlagPreset } from "~/types/preset";

type SettingsProps = {
  presets: Record<string, FlagPreset>;
};

export const Settings = ({ presets: rawPresets }: SettingsProps) => {
  return (
    <PageContainer columns={1}>
      <InGameConfigCard />
    </PageContainer>
  );
};
