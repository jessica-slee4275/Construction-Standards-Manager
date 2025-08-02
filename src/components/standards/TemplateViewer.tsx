import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import templates from "@/data/templates.json";

// Define template item structure
interface TemplateItem {
  title: string;
  content: string;
  checklist: string[];
}

type Category = 'school' | 'apartment' | 'commercial';
interface Props {
  category: Category;
}

export const TemplateViewer = ({ category }: Props) => {
  const items: TemplateItem[] = templates[category] || [];

  // State for currently checked items
  const [checkedItems, setCheckedItems] = useState<TemplateItem[]>([]);

  // State for the final created template
  const [createdTemplate, setCreatedTemplate] = useState<TemplateItem[]>([]);

  useEffect(() => {
    setCheckedItems([]);
    setCreatedTemplate([]);
  }, [category]);

  // Handle check/uncheck logic
  const toggleCheck = (item: TemplateItem) => {
    setCheckedItems((prev) =>
      prev.some((i) => i.title === item.title)
        ? prev.filter((i) => i.title !== item.title)
        : [...prev, item]
    );
  };

  // Create template from selected items
  const handleCreateTemplate = () => {
    setCreatedTemplate(checkedItems);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-6">
      {/* Left column: checklist items */}
      <div className="w-full md:w-1/2 space-y-2">
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

        {/* Button to generate the template */}
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          onClick={handleCreateTemplate}
        >
          Create Template
        </button>
      </div>

      {/* Right column: template preview */}
      <div className="w-full md:w-1/2 border rounded-md p-4 bg-card">
        <h2 className="text-lg font-semibold mb-2 text-card-foreground">
          Created Template
        </h2>

        {createdTemplate.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Select items and click "Create Template" to see details here.
          </p>
        ) : (
          createdTemplate.map((item) => (
            <div key={item.title} className="mb-6">
              <h3 className="font-semibold text-base text-card-foreground mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {item.content}
              </p>
              <ul className="list-disc list-inside text-sm text-card-foreground space-y-1">
                {item.checklist.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
