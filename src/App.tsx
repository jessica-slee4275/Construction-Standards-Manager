// src/App.tsx

import { useState } from "react";
import { TemplateSelector } from "@/components/standards/TemplateSelector";
import { TemplateViewer } from "@/components/standards/TemplateViewer";

function App() {
  const [selected, setSelected] = useState("");

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">📋 Select Template</h1>
      <TemplateSelector onSelect={setSelected} />
      {selected && <TemplateViewer category={selected} />}
    </main>
  );
}

export default App;
