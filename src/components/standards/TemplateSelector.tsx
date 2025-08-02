import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    onSelect: (category: string) => void;
}

export const TemplateSelector = ({ onSelect }: Props) => {
    return (
    <div className="w-64 mb-4">
        <Select onValueChange={onSelect}>
            <SelectTrigger>
                <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
        </Select>
    </div>
    );
};
