import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ObjectiveCard } from "~/card-components/ObjectiveCard";
import { Button, Card } from "@ff6wc/ui";
import { selectRawFlags, setFlag } from "~/state/flagSlice";
import {
  addObjective,
  alphabet,
  DEFAULT_OBJECTIVE_VALUE,
  MAX_OBJECTIVE_COUNT,
  selectObjectives,
  setRawObjectives,
} from "~/state/objectiveSlice";
import { PageContainer } from "~/components/PageContainer/PageContainer";

export const Objectives = () => {
  const dispatch = useDispatch();
  const rawFlags = useSelector(selectRawFlags);

  const objectives = Object.values(useSelector(selectObjectives) ?? {});

  useEffect(() => {
    dispatch(setRawObjectives(rawFlags));
  }, [dispatch]);

  const onAddObjective = () => {
    const nextObjectiveId = objectives.length;
    const letter = alphabet[nextObjectiveId];
    const flag = `-o${letter}`;
    dispatch(
      addObjective({
        flag,
        letter,
      })
    );
    dispatch(
      setFlag({
        flag,
        value: DEFAULT_OBJECTIVE_VALUE,
      })
    );
  };

  return (
    <PageContainer columns={3}>
      <div className="col-span-full flex flex-col gap-4 w-full">
        <Card title="Objectives">
          <span>
            <Button
              disabled={objectives.length >= MAX_OBJECTIVE_COUNT}
              onClick={onAddObjective}
              variant="primary"
            >
              Add Objective
            </Button>
          </span>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {objectives.map((objective) => (
            <div key={objective.flag}>
              <ObjectiveCard key={objective.flag} objective={objective} />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
