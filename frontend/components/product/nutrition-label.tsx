// The nutrition facts label of a product page, drawn from the product's typed
// values (spec decision 8): no editor builds this table by hand.
import { cn } from "@/lib/utils";
import type { NutritionValues } from "./model";

type Row = {
  label: string;
  amount: number | null | undefined;
  unit: string;
  dailyValue?: number | null;
  /** A row without a recommended daily value. */
  noDailyValue?: boolean;
  strong?: boolean;
  indent?: boolean;
  /** The heavy rule under the row. */
  rule?: "thick" | "medium";
};

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

export function nutritionRows(values: NutritionValues): Row[] {
  return [
    { label: "Total Fat", amount: values.totalFat, unit: "g", dailyValue: values.totalFatDailyValue, strong: true },
    { label: "Saturated Fat", amount: values.saturatedFat, unit: "g", dailyValue: values.saturatedFatDailyValue, indent: true },
    { label: "Trans Fat", amount: values.transFat, unit: "g", noDailyValue: true, indent: true },
    { label: "Cholesterol", amount: values.cholesterol, unit: "mg", dailyValue: values.cholesterolDailyValue, strong: true },
    { label: "Sodium", amount: values.sodium, unit: "mg", dailyValue: values.sodiumDailyValue, strong: true },
    { label: "Total Carbohydrates", amount: values.totalCarbohydrates, unit: "g", dailyValue: values.totalCarbohydratesDailyValue, strong: true },
    { label: "Dietary Fiber", amount: values.dietaryFiber, unit: "g", dailyValue: values.dietaryFiberDailyValue, indent: true },
    { label: "Total Sugars", amount: values.totalSugars, unit: "g", noDailyValue: true, indent: true },
    { label: "Added Sugars", amount: values.addedSugars, unit: "g", dailyValue: values.addedSugarsDailyValue, indent: true },
    { label: "Protein", amount: values.protein, unit: "g", noDailyValue: true, strong: true, rule: "thick" },
    { label: "Vitamin D", amount: values.vitaminD, unit: "mcg", dailyValue: values.vitaminDDailyValue },
    { label: "Calcium", amount: values.calcium, unit: "mg", dailyValue: values.calciumDailyValue },
    { label: "Iron", amount: values.iron, unit: "mg", dailyValue: values.ironDailyValue },
    { label: "Potassium", amount: values.potassium, unit: "mg", dailyValue: values.potassiumDailyValue, rule: "medium" },
  ];
}

export function NutritionLabel({
  dataSanity,
  values,
}: {
  dataSanity?: string;
  values: NutritionValues;
}) {
  return (
    <div
      className="mx-auto w-full max-w-sm border-2 border-card-foreground bg-card px-2 text-card-foreground"
      data-sanity={dataSanity}
    >
      <div className="border-t-[1.25rem] border-b-8 border-card-foreground pt-2 pb-3 font-bold">
        <p className="text-lg">Amount per serving</p>
        <p className="-mt-2 flex items-baseline justify-between">
          <span className="text-4xl">Calories</span>
          <span className="text-5xl">{formatNumber(values.calories)}</span>
        </p>
      </div>
      <table className="mb-3 w-full border-collapse font-sans text-lg">
        <thead>
          <tr className="border-b border-card-foreground">
            <th scope="col" className="text-left font-normal">
              <span className="sr-only">Nutrient</span>
            </th>
            <th scope="col" className="text-right font-bold">
              % Daily Value*
            </th>
          </tr>
        </thead>
        <tbody>
          {nutritionRows(values).map((row) => (
            <tr
              className={cn(
                "border-b border-card-foreground",
                row.rule === "thick" && "border-b-[0.8rem]",
                row.rule === "medium" && "border-b-8",
              )}
              key={row.label}
            >
              <th scope="row" className={cn("py-0.5 text-left font-normal", row.indent && "pl-5")}>
                {row.label === "Added Sugars" ? (
                  <>Includes {formatNumber(row.amount)}{row.unit} Added Sugars</>
                ) : (
                  <>
                    {row.strong ? <strong>{row.label}</strong> : row.label} {formatNumber(row.amount)}
                    {row.unit}
                  </>
                )}
              </th>
              <td className="py-0.5 text-right">
                {row.noDailyValue ? (
                  <span className="sr-only">no recommended daily value</span>
                ) : (
                  `${formatNumber(row.dailyValue)}%`
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
