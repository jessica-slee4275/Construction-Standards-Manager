import { Card, CardContent } from "@/components/ui/card";
import templates from "@/data/templates.json";

interface TemplateItem {
  title: string;
  content: string;
  checklist: string[];
}

type Category = 'school' | 'apartment' | 'commercial';

interface Props {
  category: Category;
  checkedItems: TemplateItem[];
  setCheckedItems: React.Dispatch<React.SetStateAction<TemplateItem[]>>;
}

export const TemplateViewer = ({ category, checkedItems, setCheckedItems }: Props) => {
  const items: TemplateItem[] = templates[category] || [];

  const toggleCheck = (item: TemplateItem) => {
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
