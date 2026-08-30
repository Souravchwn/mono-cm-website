import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export function FloatingControls() {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-center gap-3 sm:right-6 sm:bottom-6">
      <ScrollToTopButton />
      <ThemeToggle />
    </div>
  );
}
