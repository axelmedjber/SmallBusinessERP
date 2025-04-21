import { AlertCircle, RefreshCw, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/use-language";
import { translations } from "@/lib/utils";

interface ErrorContainerProps {
  title?: string;
  message?: string;
  retry?: () => void;
  isRetrying?: boolean;
  errorCode?: string | number;
}

export function ErrorContainer({
  title,
  message,
  retry,
  isRetrying = false,
  errorCode,
}: ErrorContainerProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <Alert variant="destructive" className="my-4 border-red-300">
      <AlertCircle className="h-5 w-5" />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-start">
          <AlertTitle>{title || t.error}</AlertTitle>
          {errorCode && (
            <span className="text-xs border border-red-200 px-2 py-1 rounded">
              {typeof errorCode === "string" ? errorCode : `Error ${errorCode}`}
            </span>
          )}
        </div>
        <AlertDescription className="text-sm">
          {message || t.genericError}
        </AlertDescription>
        {retry && (
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retry} 
              disabled={isRetrying}
              className="border-red-300 text-red-800 hover:bg-red-50 hover:text-red-900"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t.retrying}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t.retry}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
}

export function NetworkErrorContainer({
  retry,
  isRetrying = false,
}: {
  retry?: () => void;
  isRetrying?: boolean;
}) {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <ErrorContainer
      title={t.networkError}
      message={t.networkErrorMessage}
      retry={retry}
      isRetrying={isRetrying}
      errorCode="NETWORK_ERROR"
    />
  );
}

export function AccessDeniedContainer() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <ErrorContainer
      title={t.accessDenied}
      message={t.accessDeniedMessage}
      errorCode="ACCESS_DENIED"
    />
  );
}

export function NotFoundContainer() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <ErrorContainer
      title={t.notFound}
      message={t.notFoundMessage}
      errorCode="NOT_FOUND"
    />
  );
}

export function ServerErrorContainer({
  retry,
  isRetrying = false,
}: {
  retry?: () => void;
  isRetrying?: boolean;
}) {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <ErrorContainer
      title={t.serverError}
      message={t.serverErrorMessage}
      retry={retry}
      isRetrying={isRetrying}
      errorCode="SERVER_ERROR"
    />
  );
}