import { Card } from "@ff6wc/ui";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import {
  FlagSubflagSelect,
  SubflagOption,
} from "~/components/FlagSubflagSelect/FlagSubflagSelect";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import { Select, SelectOption } from "~/components/Select/Select";
import { setFlag, useFlagValueSelector } from "~/state/flagSlice";

const stealOptions: SubflagOption[] = [
  {
    defaultValue: true,
    flag: "-sch",
    label: "Higher",
    helperText: "Steal rate is improved and rare steals are more likely",
    Renderable: null,
  },
  {
    defaultValue: true,
    flag: "-sca",
    label: "Always",
    helperText: "Steal will always succeed if an enemy has an item",
    Renderable: null,
  },
];

const dropdownOptions: SelectOption[] = [
  {
    value: "original",
    label: "Original",
    helperText: "Drops are original",
  },
  {
    value: "shuffle_random",
    label: "Shuffle + Random",
    helperText: "Shuffle items stolen and dropped with randomized percent",
  },
];

export const StealCapture = () => {
  const dispatch = useDispatch();
  const ss = useFlagValueSelector<number | null>("-ss");
  const sd = useFlagValueSelector<number | null>("-sd");

  const isShuffleAndRandom = ss != null || sd != null;

  useEffect(() => {
    if (ss != null && sd == null) {
      dispatch(setFlag({ flag: "-sd", value: 10 }));
    } else if (sd != null && ss == null) {
      dispatch(setFlag({ flag: "-ss", value: 10 }));
    }
  }, [ss, sd, dispatch]);

  const activeOption = isShuffleAndRandom
    ? dropdownOptions[1]
    : dropdownOptions[0];

  const handleDropdownChange = (selected: SelectOption | null) => {
    if (selected?.value === "original") {
      dispatch(setFlag({ flag: "-ss", value: null }));
      dispatch(setFlag({ flag: "-sd", value: null }));
    } else if (selected?.value === "shuffle_random") {
      dispatch(setFlag({ flag: "-ss", value: ss ?? 10 }));
      dispatch(setFlag({ flag: "-sd", value: sd ?? 10 }));
    }
  };

  return (
    <Card title={"Steal/Capture"}>
      <CardColumn>
        <FlagSubflagSelect
          label="Chance to Steal"
          nullable={{
            label: "Original",
            description: "Original steal changes",
          }}
          options={stealOptions}
        />

        <FlagSwitch
          flag="-fc"
          helperText="When enabled, multi-steal can give more than one item, and weapon specials can now proc using the Capture command"
          label="Fix Capture Bugs"
        />

        <div className="flex flex-col gap-2">
          <FlagLabel
            flag="-ss"
            hideFlag={true}
            label="Steals & Drops"
            helperText={
              isShuffleAndRandom
                ? "Shuffle items stolen and dropped with randomized percent"
                : "Drops are original"
            }
          />
          <Select
            options={dropdownOptions}
            value={activeOption}
            onChange={handleDropdownChange}
          />
        </div>

        {isShuffleAndRandom && (
          <>
            <FlagSlider
              flag="-ss"
              label="Shuffle Stolen Items"
              helperText="Shuffle items stolen with randomized percent"
            />

            <FlagSlider
              flag="-sd"
              label="Shuffle Dropped Items"
              helperText="Shuffle items dropped with randomized percent"
            />
          </>
        )}
      </CardColumn>
    </Card>
  );
};
