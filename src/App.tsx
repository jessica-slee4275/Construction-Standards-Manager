import { useState, useEffect } from "react";
import axios from "axios";
import { TemplateViewer } from "@/components/standards/TemplateViewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Define the TemplateItem type
interface TemplateItem {
  title: string;
  subtitle: string;
  checklist: string[];
}

type Category = "school" | "apartment" | "commercial";

export default function App() {
  const [category, setCategory] = useState<Category>("school");
  const [checkedItems, setCheckedItems] = useState<TemplateItem[]>([]);
  const [createdTemplate, setCreatedTemplate] = useState<TemplateItem[]>([]);
  const [templateTitle, setTemplateTitle] = useState("");
  const [savedTemplates, setSavedTemplates] = useState<TemplateItemWithMeta[]>([]);

  // Reset state when category changes
  useEffect(() => {
    setCheckedItems([]);
    setCreatedTemplate([]);
    loadTemplates(); 
  }, [category]);

  // Handle "Create Template" button click
  const handleCreateTemplate = () => {
    if (checkedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    const newTemplate: TemplateItem = {
      title: templateTitle || "Untitled Template",
      subtitle: checkedItems.map((item) => item.title).join(", "),
      checklist: checkedItems.flatMap((item) => item.checklist),
    };

    setCreatedTemplate([newTemplate]);
  };

  // Handle "Save Template" button click
  const handleSaveTemplate = async () => {
    if (!templateTitle || createdTemplate.length === 0) {
      alert("Please enter a template title and generate a template.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/templates", {
        title: templateTitle,
        subtitle: createdTemplate[0].subtitle,
        checklist: createdTemplate[0].checklist,
        category: category,
      });

      alert("Template saved successfully.");
      setTemplateTitle("");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template.");
    }
  };

  interface TemplateItemWithMeta {
    id: string;
    title: string;
    subtitle: string;
    checklist: string[];
    category: string;
    created_at: string;
  }

  const loadTemplates = async () => {
  try {
      const res = await axios.get("http://localhost:5000/api/templates");
      setSavedTemplates(res.data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      alert("Failed to load templates");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/templates/${id}`);
      setSavedTemplates((prev) => prev.filter((t) => t.id !== id));
      alert("Deleted");
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Category selection buttons */}
      <div className="space-x-2">
        <Button
          variant={category === "school" ? "default" : "outline"}
          onClick={() => setCategory("school")}
        >
          School
        </Button>
        <Button
          variant={category === "apartment" ? "default" : "outline"}
          onClick={() => setCategory("apartment")}
        >
          Apartment
        </Button>
        <Button
          variant={category === "commercial" ? "default" : "outline"}
          onClick={() => setCategory("commercial")}
        >
          Commercial
        </Button>
      </div>


      {/* Template title input and creation */}
      <div className="space-y-3">
        <Input
          placeholder="Enter template title..."
          value={templateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
        />
        <Button onClick={handleCreateTemplate}>Create Template</Button>
        <br/>
        <Button onClick={loadTemplates}>Load Saved Templates</Button>

      </div>

      {/* Preview and save section */}
      {createdTemplate.length > 0 && (
        <div className="border p-4 rounded bg-muted">
          <h2 className="text-lg font-semibold mb-2">Created Template</h2>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>{createdTemplate[0].title}</strong>:{" "}
            {createdTemplate[0].subtitle}
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {createdTemplate[0].checklist.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
          <Button className="mt-4" onClick={handleSaveTemplate}>
            Save Template
          </Button>
        </div>
      )}

      {savedTemplates.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Saved Templates</h2>
          {savedTemplates.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 space-y-1">
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-muted-foreground">{t.subtitle}</div>
                <div className="text-xs text-gray-500">{t.category} · {new Date(t.created_at).toLocaleString()}</div>
                <ul className="list-disc list-inside text-sm mt-2">
                  {Array.isArray(t.checklist) ? (
                    t.checklist.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li className="text-muted-foreground text-sm italic">No checklist available</li>
                  )}
                </ul>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(t.id)}
                  className="mt-2"
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
