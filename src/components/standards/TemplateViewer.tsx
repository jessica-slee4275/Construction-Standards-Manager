import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const templates = {
  apartment: [
    "Fire Safety Inspection",
    "Structural Review",
    "Electrical System Inspection",
  ],
  school: [
    "Fire Protection Equipment Check",
    "Accessibility Facility Verification",
    "Security Camera Placement",
  ],
  commercial: [
    "Freight Circulation Check",
    "Façade Design Review by Store",
    "Power Distribution Plan",
  ],
};
interface Props {
  category: string;
}

export const TemplateViewer = ({ category }: Props) => {
  const items = templates[category as keyof typeof templates] || [];

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <Card key={idx}>
          <CardContent className="flex items-center gap-4 py-4">
            <Checkbox id={`check-${idx}`} />
            <label htmlFor={`check-${idx}`} className="text-sm font-medium">
              {item}
            </label>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
