"use client";

import { useState, useCallback, useRef } from "react";
import { FileText, Upload, ClipboardPaste, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppState } from "@/lib/store";
import {
  parseTextToQuestions,
  readExcelFile,
  parseExcelToQuestions,
  extractTextFromPdf,
  extractQuestionsWithAI,
  deduplicateQuestions,
} from "@/lib/parsers";
import type { RfpQuestion } from "@/types";
import { CATEGORY_CONFIG } from "@/types";

type InputMode = "paste" | "upload";

export default function QuestionInput() {
  const dispatch = useAppDispatch();
  const { questions: existingQuestions } = useAppState();
  const [mode, setMode] = useState<InputMode>("paste");
  const [pasteText, setPasteText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<RfpQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = useCallback(() => {
    if (!pasteText.trim()) return;
    setError(null);
    const parsed = parseTextToQuestions(pasteText);
    if (parsed.length === 0) {
      setError("No questions could be parsed from the text.");
      return;
    }
    const unique = deduplicateQuestions(existingQuestions, parsed);
    if (unique.length === 0) {
      setError("All parsed questions are duplicates of existing ones.");
      return;
    }
    setPreviewQuestions(unique);
  }, [pasteText, existingQuestions]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate size
      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }

      setError(null);
      setIsProcessing(true);
      setUploadedFileName(file.name);

      try {
        let parsed: RfpQuestion[];

        if (file.name.endsWith(".pdf")) {
          // Extract raw text, then use AI to identify actual questions/requirements
          const text = await extractTextFromPdf(file);
          parsed = await extractQuestionsWithAI(text);
        } else if (
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv")
        ) {
          const { data, headers } = await readExcelFile(file);
          parsed = parseExcelToQuestions(data, headers);
        } else {
          // Plain text
          const text = await file.text();
          parsed = parseTextToQuestions(text);
        }

        if (parsed.length === 0) {
          setError("No questions could be extracted from this file.");
          setIsProcessing(false);
          return;
        }

        const unique = deduplicateQuestions(existingQuestions, parsed);
        if (unique.length === 0) {
          setError("All extracted questions are duplicates.");
          setIsProcessing(false);
          return;
        }

        setPreviewQuestions(unique);
      } catch (err) {
        setError(`Failed to parse file: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [existingQuestions]
  );

  const handleAddAll = useCallback(() => {
    if (previewQuestions.length === 0) return;
    dispatch({ type: "ADD_QUESTIONS", questions: previewQuestions });
    setPreviewQuestions([]);
    setPasteText("");
    setUploadedFileName(null);
  }, [previewQuestions, dispatch]);

  const handleRemovePreview = useCallback((id: string) => {
    setPreviewQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleClearPreview = useCallback(() => {
    setPreviewQuestions([]);
    setPasteText("");
    setUploadedFileName(null);
    setError(null);
  }, []);

  return (
    <div>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode("paste"); handleClearPreview(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-[var(--r)] text-xs font-medium transition-all ${
            mode === "paste"
              ? "bg-[var(--accent-pale)] text-[var(--accent)] border border-[var(--accent-bd)]"
              : "bg-[var(--surface)] text-[var(--text3)] border border-[var(--border)] hover:bg-[var(--surface3)]"
          }`}
        >
          <ClipboardPaste size={14} />
          Paste Text
        </button>
        <button
          onClick={() => { setMode("upload"); handleClearPreview(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-[var(--r)] text-xs font-medium transition-all ${
            mode === "upload"
              ? "bg-[var(--accent-pale)] text-[var(--accent)] border border-[var(--accent-bd)]"
              : "bg-[var(--surface)] text-[var(--text3)] border border-[var(--border)] hover:bg-[var(--surface3)]"
          }`}
        >
          <Upload size={14} />
          Upload File
        </button>
      </div>

      {/* Paste Mode */}
      {mode === "paste" && (
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Paste RFP questions here...\n\n1. How does your platform handle data security?\n2. Describe your implementation methodology.\n3. What integrations do you support?\n\n- Or use bullet points\n- Each line becomes a question`}
            className="w-full h-40 px-4 py-3 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none font-sans"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="font-mono text-[10px] text-[var(--text4)]">
              {pasteText.split("\n").filter(Boolean).length} lines
            </span>
            <button
              onClick={handleParse}
              disabled={!pasteText.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-[var(--r)] bg-[var(--accent)] text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Parse Questions
            </button>
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-[var(--border)] rounded-[var(--r-lg)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-pale)] transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 size={24} className="text-[var(--accent)] animate-spin" />
                <span className="text-xs text-[var(--text3)]">
                  {uploadedFileName?.endsWith(".pdf")
                    ? "Extracting requirements with AI..."
                    : `Processing ${uploadedFileName}...`}
                </span>
              </>
            ) : uploadedFileName ? (
              <>
                <CheckCircle2 size={24} className="text-[var(--pos)]" />
                <span className="text-xs text-[var(--text2)] font-medium">{uploadedFileName}</span>
              </>
            ) : (
              <>
                <FileText size={24} className="text-[var(--text4)]" />
                <span className="text-xs text-[var(--text3)]">
                  Drop PDF, Excel, CSV, or text file
                </span>
                <span className="font-mono text-[9px] text-[var(--text4)]">Max 10MB</span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-[var(--r)] text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Preview */}
      {previewQuestions.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)]">
              Extracted Requirements ({previewQuestions.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleClearPreview}
                className="text-[10px] text-[var(--text4)] hover:text-[var(--text2)] font-mono uppercase tracking-wide"
              >
                Clear
              </button>
              <button
                onClick={handleAddAll}
                className="px-3 py-1 text-[10px] font-semibold rounded-md bg-[var(--accent)] text-white hover:brightness-110 transition-all"
              >
                Add All
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {previewQuestions.map((q) => {
              const cat = CATEGORY_CONFIG[q.category];
              return (
                <div
                  key={q.id}
                  className="flex items-start gap-3 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                  style={{ borderLeftWidth: 3, borderLeftColor: cat.color }}
                >
                  <span className="text-[11px] text-[var(--text)] leading-[1.5] flex-1">
                    {q.text}
                  </span>
                  <span
                    className="font-mono text-[8px] font-semibold uppercase px-2 py-[2px] rounded-full flex-shrink-0"
                    style={{
                      background: `${cat.color}18`,
                      color: cat.color,
                    }}
                  >
                    {cat.label}
                  </span>
                  <button
                    onClick={() => handleRemovePreview(q.id)}
                    className="text-[var(--text4)] hover:text-[var(--neg)] flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
