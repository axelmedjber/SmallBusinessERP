import { useLanguage } from "@/hooks/use-language";
import { translations } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">{t.title}</h1>
        
        {/* Language Switcher */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={language === "en" ? "default" : "ghost"}
            onClick={() => setLanguage("en")}
            className={language === "en" ? "bg-primary" : "text-gray-600 hover:bg-gray-100"}
          >
            English
          </Button>
          <Button
            size="sm"
            variant={language === "fr" ? "default" : "ghost"}
            onClick={() => setLanguage("fr")}
            className={language === "fr" ? "bg-primary" : "text-gray-600 hover:bg-gray-100"}
          >
            Français
          </Button>
          <Button
            size="sm"
            variant={language === "ar" ? "default" : "ghost"}
            onClick={() => setLanguage("ar")}
            className={language === "ar" ? "bg-primary" : "text-gray-600 hover:bg-gray-100"}
          >
            العربية
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
