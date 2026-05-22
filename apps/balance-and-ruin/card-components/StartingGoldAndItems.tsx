import { useEffect, useRef, useState } from "react";
import { Card } from "@ff6wc/ui";
import { useDispatch, useSelector } from "react-redux";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { FlagNumberInput } from "~/components/FlagNumberInput/FlagNumberInput";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import { FlagTextInput } from "~/components/FlagInput/FlagInput";
import { setFlag } from "~/state/flagSlice";
import { selectStartingItems, setItems } from "~/state/itemSlice";
import { StartingItem, StartingItems } from "~/types/starting_items";
import { startingItemsToString } from "~/utils/startingItemsToString";
import { StartingItemsAddItemButton } from "~/components/StartingItemsAddItemButton/StartingItemsAddItemButton";
import { StartingItemSelect } from "~/components/StartingItemSelect/StartingItemSelect";

export interface StartingItemsProps {
  items?: StartingItems;
  curateItems?: boolean;
}

export const StartingGoldAndItems = ({ items: propsItems, curateItems = false }: StartingItemsProps) => {
  const dispatch = useDispatch();
  const reduxItems = useSelector(selectStartingItems);
  const items = propsItems ?? reduxItems;
  const scrollRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const leftHeaderRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(500);
  const prevItemsLength = useRef(items.items.length);

  useEffect(() => {
    if (items.items.length > prevItemsLength.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 50);
    }
    prevItemsLength.current = items.items.length;
  }, [items.items.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateHeight = () => {
      if (window.innerWidth >= 768 && rightColumnRef.current && leftHeaderRef.current) {
        const rightHeight = rightColumnRef.current.offsetHeight;
        const headerHeight = leftHeaderRef.current.offsetHeight;
        const availableHeight = rightHeight - headerHeight - 16; // 16px is flex gap-4
        setMaxHeight(availableHeight > 0 ? Math.max(480, availableHeight) : 480);
      } else {
        setMaxHeight(500);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    if (rightColumnRef.current) {
      observer.observe(rightColumnRef.current);
    }
    if (leftHeaderRef.current) {
      observer.observe(leftHeaderRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [items.items]);

  const onItemChange = (items: StartingItems) => {
    const sits = startingItemsToString;
    dispatch(setItems(items));
    dispatch(
      setFlag({
        flag: "-si",
        value: sits(items),
      })
    );
  };

  const validItems = items.items.filter(i => i.id >= 0 && i.name);

  return (
    <Card title={"Starting Gold/Items"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left Column: Starting Items */}
        <div className="flex flex-col gap-4 h-full">
          <div ref={leftHeaderRef} className="flex flex-col gap-1">
            <FlagLabel
              flag={"-si"}
              helperText={"The dropdown menus support searching for items"}
              label={"Starting Items"}
            />
          </div>

          <div
            ref={scrollRef}
            style={{ maxHeight: `${maxHeight}px` }}
            className={`overflow-y-auto overflow-x-hidden pr-2 flex flex-col gap-2 ${
              items.items.length > 4 ? "pb-36" : "pb-2"
            }`}
          >
            {items.items.map((i: StartingItem, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  if (idx === items.items.length - 1) {
                    setTimeout(() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTo({
                          top: scrollRef.current.scrollHeight,
                          behavior: "smooth",
                        });
                      }
                    }, 150);
                  }
                }}
                onFocusCapture={() => {
                  if (idx === items.items.length - 1) {
                    setTimeout(() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTo({
                          top: scrollRef.current.scrollHeight,
                          behavior: "smooth",
                        });
                      }
                    }, 150);
                  }
                }}
              >
                <StartingItemSelect
                  item={i}
                  items={items}
                  curateItems={curateItems}
                  onChange={onItemChange}
                />
              </div>
            ))}
            <StartingItemsAddItemButton items={items} />
          </div>
        </div>

        {/* Right Column: Sliders and numeric options + Summary at the bottom */}
        <div className="flex flex-col">
          <div ref={rightColumnRef} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <FlagNumberInput
                description="Begin the game with {{ . }} gold"
                flag="-gp"
                label="Starting Gold"
                type="int"
              />

              <FlagSlider
                helperText="Begin the game with {{ . }} different random tools"
                flag="-sto"
                label="Starting Tools"
              />

              <FlagSlider
                flag="-sj"
                label="Starting Junk"
                helperText="Begin the game with {{.}} unique low tier items (weapons, armors, helmets, shields, and relics)"
              />
            </div>

            {/* Starting Items Summary Panel */}
            <div className="flex flex-col gap-2 pt-6 border-t border-zinc-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-sub)]">
                Starting Items Summary
              </span>
              {validItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {validItems.map((item, idx) => {
                    const qty = item.min === item.max ? `${item.min}` : `${item.min}-${item.max}`;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-1.5 px-3 py-1 bg-zinc-50/60 dark:bg-[#181d29] text-[var(--text-main)] border border-zinc-200/80 dark:border-[#38445e]/50 rounded-md shadow-sm transition-all hover:bg-zinc-100/50 dark:hover:bg-[#1f2637]"
                      >
                        <span className="text-sm font-normal">{item.name}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/60 text-[var(--text-sub)] px-1.5 py-0.5 rounded text-[10px] font-bold">
                          x{qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs italic text-[var(--text-sub)]">No starting items selected.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
