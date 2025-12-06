import ButtonPreview from "@/components/ButtonPreview";
import CodeSnippet from "@/components/CodeSnippet";
import GeneratorForm from "@/components/GeneratorForm";
import { ZcashPaymentWidget } from "@/components/ZcashPaymentWidget";
import { useState } from "react";

interface GeneratedConfig {
  address: string;
  amount: number;
  label: string;
  apiBase: string;
  theme: string;
}

const Index = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig>({
    address: "xxxxxxxxxxxxxxxx...",
    amount: 0,
    label: "",
    apiBase: "",
    theme: "",
  });

  const handleGenerated = (config: GeneratedConfig) => {
    setGeneratedConfig(config);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-widget-dark-bg" : "bg-widget-light-bg"}`}
    >
      {/* Header */}
      <header className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zcash-gold to-zcash-amber flex items-center justify-center shadow-lg shadow-zcash-gold/20">
              <span className="text-widget-dark-bg font-bold text-lg">Z</span>
            </div>
            <h1
              className={`text-xl font-semibold ${theme === "dark" ? "text-widget-dark-text" : "text-widget-light-text"}`}
            >
              Pay with Zcash
            </h1>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              theme === "dark"
                ? "bg-widget-dark-surface text-widget-dark-text hover:bg-widget-dark-surface/80"
                : "bg-widget-light-surface text-widget-light-text hover:bg-widget-light-surface/80"
            }`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-4 ${theme === "dark" ? "text-widget-dark-text" : "text-widget-light-text"}`}
            >
              Zcash Payment Generator
            </h2>
            <p
              className={`text-lg max-w-xl mx-auto ${theme === "dark" ? "text-widget-dark-muted" : "text-widget-light-muted"}`}
            >
              Create beautiful, embeddable payment buttons for accepting Zcash
              on any website.
            </p>
          </div>

          {/* Generator Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <GeneratorForm onGenerated={handleGenerated} />
            <ButtonPreview config={generatedConfig} />
          </div>

          {/* Code Snippet Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <CodeSnippet config={generatedConfig} />
          </div>

          {/* Widget Demo Section */}
          <div className="text-center mb-8">
            <h3
              className={`text-2xl font-semibold mb-2 ${theme === "dark" ? "text-widget-dark-text" : "text-widget-light-text"}`}
            >
              Live Widget Demo
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-widget-dark-muted" : "text-widget-light-muted"}`}
            >
              Click the button below to see the payment modal in action
            </p>
          </div>

          <div className={`flex justify-center mb-16`}>
            <ZcashPaymentWidget
              address={generatedConfig.address}
              amount={String(generatedConfig.amount)}
              label="Donate to Open Source"
              theme={theme}
              // memo="Thank you for your support!"
            />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎨",
                title: "Themeable",
                desc: "Light and dark modes with customizable accent colors",
              },
              {
                icon: "📱",
                title: "Responsive",
                desc: "Beautiful on every device, from mobile to desktop",
              },
              {
                icon: "⚡",
                title: "Lightweight",
                desc: "Pure CSS animations, no heavy dependencies",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-widget-dark-surface hover:bg-widget-dark-surface/80"
                    : "bg-widget-light-surface hover:shadow-lg"
                }`}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3
                  className={`font-semibold mb-2 ${theme === "dark" ? "text-widget-dark-text" : "text-widget-light-text"}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm ${theme === "dark" ? "text-widget-dark-muted" : "text-widget-light-muted"}`}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
