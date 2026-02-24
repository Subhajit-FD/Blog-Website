"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const LANGUAGES = [
  { code: "en", name: "English (Default)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
  { code: "bn", name: "Bengali" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "pa", name: "Punjabi" },
  { code: "mr", name: "Marathi" },
  { code: "te", name: "Telugu" },
  { code: "tr", name: "Turkish" },
  { code: "ko", name: "Korean" },
  { code: "ta", name: "Tamil" },
  { code: "vi", name: "Vietnamese" },
  { code: "ur", name: "Urdu" },
  { code: "it", name: "Italian" },
  { code: "th", name: "Thai" },
  { code: "gu", name: "Gujarati" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "nl", name: "Dutch" },
  { code: "id", name: "Indonesian" },
];

// Tracks if script has been injected across renders
let scriptInjected = false;

export function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  const loadScript = () => {
    if (scriptInjected) return;
    scriptInjected = true;
    setScriptLoading(true);

    // @ts-ignore
    window.googleTranslateElementInit = () => {
      // @ts-ignore
      if (window.google && window.google.translate) {
        // @ts-ignore
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element",
        );
      }
      setScriptLoading(false);
    };

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      scriptInjected = false;
      setScriptLoading(false);
    };
    document.body.appendChild(script);
  };

  const handleGlobeClick = () => {
    loadScript();
    setOpen(true);
  };

  const handleLanguageSelect = (langCode: string) => {
    const selectElement = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;

    if (selectElement) {
      // 1. Change the value of the hidden Google dropdown
      // If reverting to English, Google sometimes expects an empty string or "en"
      selectElement.value = langCode === "en" ? "en" : langCode;

      // 2. Dispatch the event to trigger the translation instantly without reload
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Fallback: ONLY if the hidden dropdown fails to load for some reason
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; domain=${location.hostname}; path=/;`;
      window.location.reload();
    }

    setOpen(false);
  };

  return (
    <>
      {/* CSS to hide Google Translate UI chrome */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Hide the top banner */
        .skiptranslate > iframe.skiptranslate {
          display: none !important;
          visibility: hidden !important;
        }
        /* Prevent body from being pushed down by the hidden banner */
        body {
          top: 0 !important;
        }
        /* Hide tooltips that appear on hover */
        .goog-tooltip {
          display: none !important;
        }
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important; 
          box-shadow: none !important;
        }
        /* Hide the specific floating logo/widget you mentioned */
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `,
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Translate Page"
            onClick={handleGlobeClick}
          >
            <Globe className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
            <DialogDescription>
              Translate the website content into your preferred language.
            </DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search language..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {LANGUAGES.map((lang) => (
                  <CommandItem
                    key={lang.code}
                    value={lang.name}
                    onSelect={() => handleLanguageSelect(lang.code)}
                    className="cursor-pointer"
                  >
                    {lang.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {scriptLoading && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              Loading translator…
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden anchor div required by Google Translate SDK */}
      <div
        id="google_translate_element"
        className="w-0 h-0 overflow-hidden opacity-0 absolute pointer-events-none"
      />
    </>
  );
}
