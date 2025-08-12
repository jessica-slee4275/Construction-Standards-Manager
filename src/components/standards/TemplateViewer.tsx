import { Card, CardContent } from "@/components/ui/card";
import safetyChecklists from "@/data/safetyChecklists.json";

interface SafetyChecklistsItem {
  title: string;
  subtitle: string;
  checklist: string[];
}

type Category = 'school' | 'apartment' | 'commercial';

interface Props {
  category: Category;
  checkedItems: SafetyChecklistsItem[];
  setCheckedItems: React.Dispatch<React.SetStateAction<SafetyChecklistsItem[]>>;
}

export const TemplateViewer = ({ category, checkedItems, setCheckedItems }: Props) => {
  const items: SafetyChecklistsItem[] = safetyChecklists[category] || [];

  const toggleCheck = (item: SafetyChecklistsItem) => {
    setCheckedItems((prev) =>
      prev.some((i) => i.title === item.title)
        ? prev.filter((i) => i.title !== item.title)
        : [...prev, item]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <Card key={idx}>
          <CardContent className="flex items-center gap-3 p-4">
            <input
              type="checkbox"
              id={`check-${idx}`}
              className="h-4 w-4 border rounded-sm accent-blue-600"
              checked={checkedItems.some((i) => i.title === item.title)}
              onChange={() => toggleCheck(item)}
            />
            <label
              htmlFor={`check-${idx}`}
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {item.title}
            </label>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
