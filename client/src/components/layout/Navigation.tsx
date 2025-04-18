import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { translations } from "@/lib/utils";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [location] = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          <Link href="/">
            <a
              className={cn(
                "px-3 py-4 text-sm font-medium hover:text-gray-700 hover:border-b-2 hover:border-gray-300",
                location === "/"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              )}
            >
              {t.dashboard}
            </a>
          </Link>
          <Link href="/calendar">
            <a
              className={cn(
                "px-3 py-4 text-sm font-medium hover:text-gray-700 hover:border-b-2 hover:border-gray-300",
                location === "/calendar"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              )}
            >
              {t.calendar}
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
