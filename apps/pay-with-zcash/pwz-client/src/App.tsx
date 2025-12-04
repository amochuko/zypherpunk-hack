import { useState } from "react";
import "./App.css";
import ButtonPreview from "./components/ButtonPreview";
import CodeSnippet from "./components/CodeSnippet";
import GeneratorForm from "./components/GeneratorForm";

export interface FormConfig {
  address: string;
  amount: number;
  currency: string;
  label: string;
  qrData?: string;
}

function App() {
  const [config, setConfig] = useState<FormConfig | null>(null);

  return (
    <div style={{ maxWidth: "90%", margin: "auto", padding: 4 }}>
      <h1>Pay with Zcash Button Generator</h1>

      <GeneratorForm onGenerated={setConfig} />

      {config && (
        <>
          <ButtonPreview config={config} />
          <CodeSnippet config={config} />
        </>
      )}
    </div>
  );
}

export default App;
