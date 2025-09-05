import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaHistory,
  FaDownload,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { analyzeGrammar, getAnalysisHistory } from "../api/grammar";
import type {
  GrammarError,
  GrammarAnalysisResult,
  GrammarHistoryItem,
} from "../types/grammar";

const GrammarChecker = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<GrammarAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [history, setHistory] = useState<GrammarHistoryItem[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError(t("grammar.enterText"));
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeGrammar(text, language);
      setAnalysisResult(result);
      // Refresh history after a successful analysis
      if (user) {
        await fetchHistory();
      }
    } catch (err) {
      setError(t("common.error"));
      console.error("Grammar analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleErrorClick = (grammarError: GrammarError) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        grammarError.offset,
        grammarError.offset + grammarError.length
      );
    }
  };

  const applySuggestion = (grammarError: GrammarError, suggestion: string) => {
    const beforeError = text.substring(0, grammarError.offset);
    const afterError = text.substring(
      grammarError.offset + grammarError.length
    );
    const newText = beforeError + suggestion + afterError;
    setText(newText);

    // Remove this error from the results
    if (analysisResult) {
      const updatedErrors = analysisResult.errors.filter(
        (err) => err !== grammarError
      );
      setAnalysisResult({
        ...analysisResult,
        errors: updatedErrors,
        totalErrors: updatedErrors.length,
      });
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const data = await getAnalysisHistory();
      setHistory(data);
    } catch (err) {
      // Silently ignore for now; page remains usable
      console.error("Failed to load history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const toggleHistory = () => {
    setShowHistory((prev) => {
      const next = !prev;
      // Always refresh when opening to avoid stale or missing data
      if (next && user && !isLoadingHistory) void fetchHistory();
      return next;
    });
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory(null);
    }
  }, [user, fetchHistory]);

  const languageOptions = useMemo(
    () => [
      { code: "en", label: "English" },
      { code: "de", label: "Deutsch" },
      { code: "es", label: "Español" },
      { code: "fr", label: "Français" },
      { code: "pt", label: "Português" },
      { code: "it", label: "Italiano" },
      { code: "nl", label: "Nederlands" },
      { code: "pl", label: "Polski" },
      { code: "ru", label: "Русский" },
      { code: "zh-CN", label: "中文(简体)" },
    ],
    []
  );

  const renderTextWithHighlights = () => {
    if (!analysisResult || analysisResult.errors.length === 0) {
      return text;
    }

    const parts = [];
    let lastIndex = 0;

    // Sort errors by offset to handle overlapping highlights
    const sortedErrors = [...analysisResult.errors].sort(
      (a, b) => a.offset - b.offset
    );

    sortedErrors.forEach((grammarError, index) => {
      // Add text before the error
      if (grammarError.offset > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}-${grammarError.offset}`}>
            {text.substring(lastIndex, grammarError.offset)}
          </span>
        );
      }

      // Add highlighted error (use button for accessibility/compliance)
      parts.push(
        <button
          key={`error-${grammarError.offset}-${grammarError.length}`}
          type="button"
          className="bg-red-200 border-b-2 border-red-400 cursor-pointer hover:bg-red-300 transition-colors"
          onClick={() => handleErrorClick(grammarError)}
          title={grammarError.message}
        >
          {text.substring(
            grammarError.offset,
            grammarError.offset + grammarError.length
          )}
        </button>
      );

      lastIndex = grammarError.offset + grammarError.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  const downloadReport = () => {
    if (!analysisResult) return;

    const report = `Grammar Analysis Report
Generated: ${new Date().toLocaleString()}
User: ${user?.email || "Anonymous"}

Original Text:
${text}

Errors Found: ${analysisResult.totalErrors}

${analysisResult.errors
  .map(
    (error, index) => `
Error ${index + 1}:
- Type: ${error.rule.category.name}
- Issue: ${error.rule.description}
- Text: "${text.substring(error.offset, error.offset + error.length)}"
- Message: ${error.message}
- Suggestions: ${error.replacements.map((r) => r.value).join(", ")}
`
  )
  .join("")}`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grammar-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-b from-sky-50 via-violet-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {t("grammar.title")}{" "}
            <span role="img" aria-label="pencil">
              ✍️
            </span>
          </h1>
          <p className="text-lg text-gray-600">{t("grammar.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("grammar.yourText")}
              </h2>
              <div className="text-sm text-gray-500">
                {t("grammar.charactersCount", { count: text.length })}
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("grammar.enterText")}
              className="w-full h-80 p-4 border border-gray-200 rounded-xl shadow-inner focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              disabled={isAnalyzing}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !text.trim()}
                  className="flex items-center space-x-2 h-12 px-7 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-full hover:from-indigo-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
                >
                  {isAnalyzing ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheck />
                  )}
                  <span>
                    {isAnalyzing
                      ? t("grammar.analyzing")
                      : t("grammar.checkGrammar")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setText("")}
                  disabled={isAnalyzing}
                  className="h-12 px-5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {t("grammar.clear")}
                </button>
              </div>
              {/* Language selector */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <label
                  htmlFor="language"
                  className="text-sm text-gray-600 hidden md:block"
                >
                  {t("grammar.language")}
                </label>
                <select
                  id="language"
                  className="h-12 px-4 border border-gray-300 rounded-full text-sm bg-white"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isAnalyzing}
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {analysisResult && (
                <button
                  type="button"
                  onClick={downloadReport}
                  className="flex items-center space-x-2 h-12 px-5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <FaDownload />
                  <span>{t("grammar.downloadReport")}</span>
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("grammar.analysisResults")}
            </h2>

            {!analysisResult && !isAnalyzing && (
              <div className="text-center text-gray-500 py-12">
                <FaHistory className="mx-auto text-4xl mb-4 opacity-50" />
                <p>{t("grammar.noResults")}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <FaSpinner className="mx-auto text-4xl text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">{t("grammar.analyzing")}</p>
              </div>
            )}

            {analysisResult && (
              <div>
                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {t("grammar.summary")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {analysisResult.totalErrors === 0
                          ? t("grammar.noErrors")
                          : t("grammar.errorsFound", {
                              count: analysisResult.totalErrors,
                            })}
                      </p>
                    </div>
                    <div
                      className={`text-2xl ${
                        analysisResult.totalErrors === 0
                          ? "text-green-500"
                          : "text-orange-500"
                      }`}
                    >
                      {analysisResult.totalErrors === 0 ? (
                        <FaCheck />
                      ) : (
                        <FaExclamationTriangle />
                      )}
                    </div>
                  </div>
                </div>

                {/* Text with highlights */}
                {analysisResult.totalErrors > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {t("grammar.textWithErrors")}
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg border text-sm leading-relaxed">
                      {renderTextWithHighlights()}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t("grammar.clickToJump")}
                    </p>
                  </div>
                )}

                {/* Error Details */}
                {analysisResult.totalErrors > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      {t("grammar.errorDetails")}
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {analysisResult.errors.map((grammarError, index) => (
                        <div
                          key={`detail-${grammarError.offset}-${grammarError.length}-${index}`}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-red-600">
                                {grammarError.rule.category.name}
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {grammarError.message}
                              </p>
                            </div>
                          </div>

                          <div className="mb-2">
                            <span className="text-xs text-gray-500">
                              {t("grammar.found")}{" "}
                            </span>
                            <span className="bg-red-100 px-2 py-1 rounded text-sm">
                              "
                              {text.substring(
                                grammarError.offset,
                                grammarError.offset + grammarError.length
                              )}
                              "
                            </span>
                          </div>

                          {grammarError.replacements.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-500 block mb-1">
                                {t("grammar.suggestions")}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {grammarError.replacements
                                  .slice(0, 3)
                                  .map((replacement, idx) => (
                                    <button
                                      type="button"
                                      key={`rep-${grammarError.offset}-${replacement.value}-${idx}`}
                                      onClick={() =>
                                        applySuggestion(
                                          grammarError,
                                          replacement.value
                                        )
                                      }
                                      className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm transition-colors"
                                    >
                                      "{replacement.value}"
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaHistory /> {t("grammar.history")}
              </h2>
              <button
                type="button"
                className="text-sm px-3 py-1 rounded-full bg-violet-50 text-violet-700 hover:bg-violet-100"
                onClick={toggleHistory}
              >
                {showHistory
                  ? t("grammar.hideHistory")
                  : t("grammar.showHistory")}
              </button>
            </div>

            {!user && (
              <p className="text-sm text-gray-500">
                {t("grammar.loginToSeeHistory")}
              </p>
            )}

            {user && (
              <div
                className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                  showHistory ? "max-h-96" : "max-h-0"
                }`}
                aria-hidden={!showHistory}
              >
                {isLoadingHistory && (
                  <div className="text-sm text-gray-500">
                    {t("common.loading")}
                  </div>
                )}

                {!isLoadingHistory && history && history.length === 0 && (
                  <div className="text-sm text-gray-500">
                    {t("grammar.noHistory")}
                  </div>
                )}

                {!isLoadingHistory && history && history.length > 0 && (
                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <li key={item.id} className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="text-sm text-gray-800 line-clamp-2">
                              {item.text}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              <span className="mr-3">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                              <span className="mr-3 uppercase">
                                {item.language}
                              </span>
                              <span>
                                {item.totalErrors === 0
                                  ? t("grammar.noErrors")
                                  : t("grammar.errorsFound", {
                                      count: item.totalErrors,
                                    })}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => {
                              setText(item.text);
                              setAnalysisResult({
                                errors: item.errors,
                                totalErrors: item.totalErrors,
                                language: item.language,
                                processingTime: item.processingTime,
                                textLength: item.text.length,
                              });
                            }}
                          >
                            {t("common.view")}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarChecker;
