import { useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Spinner,
} from "flowbite-react";
import { HiArrowsExpand } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { scan } from "../lib/api.js";

function ModeSwitch({ mode, setMode, disabled }) {
  return (
    <div className="relative w-full max-w-[420px]">
      <div className="relative grid grid-cols-2 items-center rounded-xl p-1 bg-gray-200/40 dark:bg-gray-700/40">
        <motion.div
          className="absolute top-1 bottom-1 left-1 rounded-lg shadow-md"
          style={{ width: "calc(50% - 0.25rem)" }}
          initial={false}
          animate={{ x: mode === "url" ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          <div className="h-full w-full rounded-lg bg-gradient-to-br from-purple-600 to-blue-500" />
        </motion.div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("url")}
          className={`relative z-10 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
            mode === "url"
              ? "text-white"
              : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          } disabled:opacity-50 disabled:pointer-events-none`}
        >
          URL mode
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("html")}
          className={`relative z-10 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
            mode === "html"
              ? "text-white"
              : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          } disabled:opacity-50 disabled:pointer-events-none`}
        >
          HTML mode
        </button>
      </div>
    </div>
  );
}

export default function ScanForm({
  mode,
  setMode,
  url,
  setUrl,
  html,
  setHtml,
  onStart,
  onResult,
  onError,
  onClear,
  onNewPayload,
  className = "",
  busy = false,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);

  const trimmedUrl = (url || "").trim();
  const trimmedHtml = (html || "").trim();

  const hasInput =
    (mode === "url" && trimmedUrl.length > 0) ||
    (mode === "html" && trimmedHtml.length > 0);

  function isLikelyUrl(s) {
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }
  function isLikelyHtml(s) {
    if (!s) return false;
    try {
      const doc = new DOMParser().parseFromString(s, "text/html");
      return !!doc.body && !!doc.body.querySelector("*");
    } catch {
      return false;
    }
  }

  const payload = () =>
    mode === "url" ? { url: trimmedUrl } : { html: trimmedHtml };

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!hasInput || submitting || busy) return;

    setSubmitting(true);

    if (mode === "url" && !isLikelyUrl(trimmedUrl)) {
      onStart?.();
      onError?.("Please enter a valid URL (include http:// or https://)");
      setSubmitting(false);
      return;
    }
    if (mode === "html" && !isLikelyHtml(trimmedHtml)) {
      onStart?.();
      onError?.("No valid HTML detected. Paste real HTML tags or switch to URL mode.");
      setSubmitting(false);
      return;
    }

    const p = payload();
    onNewPayload?.(p);
    onStart?.();

    try {
      const data = await scan(p);
      onResult?.(data);
    } catch (err) {
      onError?.(err?.message || "Scan failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClear() {
    if (submitting || busy) return;
    setUrl("");
    setHtml("");
    onClear?.();
  }

  const isLoading = busy || submitting;
  const INPUT_H = "h-12"; // make collapsed input same size as TextInput

  return (
    <Card className={`h-full ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">
          Scan Configuration
        </h2>
        <Button
          color="light"
          size="xs"
          onClick={() => setExpandOpen(true)}
          disabled={isLoading}
          className={mode === "html" ? "" : "invisible"}
        >
          <HiArrowsExpand className="mr-2" />
          Expand
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex h-[calc(100%-2.75rem)] flex-col gap-4"
      >
        <ModeSwitch mode={mode} setMode={setMode} disabled={isLoading} />

        <div className={INPUT_H}>
          {mode === "url" ? (
            <div className="h-full flex items-start">
              <TextInput
                className="w-full"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="h-full flex items-start">
              <TextInput
                className="w-full"
                placeholder="<div>Paste HTML here</div>"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-3">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!hasInput || isLoading}
            aria-busy={isLoading ? "true" : "false"}
            className="flex-1 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium
                       text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br
                       focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                       shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80
                       disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Scanning…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 me-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7-11-7z" />
                </svg>
                Start Scan
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="ml-auto inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium
                       text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100
                       disabled:opacity-50 disabled:pointer-events-none
                       dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            <svg
              className="w-4 h-4 me-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Clear
          </button>
        </div>
      </form>

      {/* Custom Modal */}
      <AnimatePresence>
        {expandOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} // fade-out
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit HTML
                </h3>
                <button
                  onClick={() => setExpandOpen(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="h-[60vh] w-full resize-none thin-scrollbar"
                  placeholder="<div>Paste HTML here</div>"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
                <button
                  onClick={() => setExpandOpen(false)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save & Close
                </button>
                <button
                  onClick={() => setExpandOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
