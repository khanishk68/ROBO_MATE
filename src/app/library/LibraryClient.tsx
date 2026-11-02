// src/app/library/LibraryClient.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toaster";
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

export interface DocumentItem {
  id: string;
  name: string;
  sizeBytes: number;
  url: string;
  monthNumber: number;
  subject: string;
  description: string;
  uploadDate: string;
  isOfficial?: boolean;
}

const OFFICIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-official-month1",
    name: "Khanishk_Month_1_Robotics_Engineering_Plan.pdf",
    sizeBytes: 42952,
    url: "/curriculum/Khanishk_Month_1_Robotics_Engineering_Plan.pdf",
    monthNumber: 1,
    subject: "Robotics Engineering Foundation (Python, Git & Linux)",
    description: "Official 6-page comprehensive curriculum: 30 individual days, equipment checklist, 7 verified study resources, and Robot Mission Logger v1 capstone.",
    uploadDate: "2026-11-02T19:00:00Z",
    isOfficial: true,
  },
];

export function LibraryClient() {
  const { profile, activeProfile } = useAuth();
  const { isBoyMode } = useTheme();
  const { success, error: showError } = useToast();
  const currentProfile = activeProfile || profile;
  const supabase = createClient();

  const [documents, setDocuments] = useState<DocumentItem[]>(OFFICIAL_DOCUMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  // Upload modal & state
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMonth, setUploadMonth] = useState(1);
  const [uploadSubject, setUploadSubject] = useState("Robotics Engineering Foundation");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Preview Reader modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Delete confirmation modal state
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  // Load custom uploaded documents from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("uploaded_documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && isMounted) {
          const remoteDocs: DocumentItem[] = data.map((d) => ({
            id: d.id,
            name: d.file_name,
            sizeBytes: d.file_size,
            url: d.file_url,
            monthNumber: d.month_number,
            subject: d.subject,
            description: d.description || "",
            uploadDate: d.created_at,
            isOfficial: false,
          }));

          setDocuments([...OFFICIAL_DOCUMENTS, ...remoteDocs]);
        }
      } catch (err) {
        console.warn("Could not fetch remote documents, showing pre-seeded library:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showError("Invalid File Type", "Only PDF documents are supported (.pdf).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showError("File Too Large", "Maximum supported PDF file size is 25MB.");
      return;
    }
    setSelectedFile(file);
    if (!uploadDescription) {
      setUploadDescription(`Study document for Month ${uploadMonth}: ${file.name}`);
    }
  };

  // Perform PDF Upload to Supabase Storage
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showError("No file selected", "Please choose or drop a PDF file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${currentProfile?.id || "common"}/${timestamp}_${sanitizedName}`;

      // 1. Upload to Supabase Storage bucket 'study-materials'
      const { data: storageData, error: storageError } = await supabase.storage
        .from("study-materials")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      let publicUrl = "";
      if (!storageError) {
        const { data: urlData } = supabase.storage
          .from("study-materials")
          .getPublicUrl(storagePath);
        publicUrl = urlData.publicUrl;
      } else {
        // Fallback: create object URL if storage bucket is not configured yet
        publicUrl = URL.createObjectURL(selectedFile);
      }

      // 2. Insert metadata into 'uploaded_documents'
      const newDocRecord = {
        profile_id: currentProfile?.id || null,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_url: publicUrl,
        storage_path: storagePath,
        month_number: uploadMonth,
        subject: uploadSubject,
        description: uploadDescription || null,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from("uploaded_documents")
        .insert(newDocRecord)
        .select()
        .single();

      const createdItem: DocumentItem = {
        id: insertedData?.id || `local-${timestamp}`,
        name: selectedFile.name,
        sizeBytes: selectedFile.size,
        url: publicUrl,
        monthNumber: uploadMonth,
        subject: uploadSubject,
        description: uploadDescription,
        uploadDate: new Date().toISOString(),
        isOfficial: false,
      };

      setDocuments((prev) => [createdItem, ...prev]);
      success("PDF Uploaded Successfully", `${selectedFile.name} added to your Study Library.`);

      // Reset form
      setSelectedFile(null);
      setUploadDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);
      showError("Upload Failed", err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Document
  const confirmDelete = async () => {
    if (!docToDelete) return;
    if (docToDelete.isOfficial) {
      showError("Protected Document", "Official curriculum documents cannot be deleted.");
      setDocToDelete(null);
      return;
    }

    try {
      await supabase.from("uploaded_documents").delete().eq("id", docToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      success("Document Deleted", `${docToDelete.name} was removed from your Study Library.`);
    } catch (err: any) {
      showError("Delete failed", err.message);
    } finally {
      setDocToDelete(null);
    }
  };

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (selectedMonth !== "all" && doc.monthNumber !== selectedMonth) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSub = doc.subject.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      return matchName || matchSub || matchDesc;
    }
    return true;
  });

  return (
    <AppShell title="Study Library & PDF Materials">
      <div className="space-y-6 pb-16">
        {/* Header Hero */}
        <div
          className="rounded-2xl border p-5 sm:p-7 relative overflow-hidden backdrop-blur-md"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold border tracking-wide uppercase flex items-center gap-1.5"
                  style={{
                    background: isBoyMode ? "rgba(37,99,235,0.15)" : "rgba(217,107,145,0.15)",
                    borderColor: isBoyMode ? "rgba(56,189,248,0.4)" : "rgba(245,184,204,0.6)",
                    color: isBoyMode ? "#38BDF8" : "#D96B91",
                  }}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Robotics Documentation Centre
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
                >
                  {documents.length} Materials
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Study Library &amp; Document Repository
              </h1>
              <p className="mt-1 text-xs sm:text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                Upload monthly study plan PDFs, datasheets, circuit schematics, and lecture materials. Read documents in-browser with zoom and page controls.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Dropzone & Form Section */}
        <div
          className="rounded-2xl border p-5 sm:p-6 space-y-4"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <UploadCloud className="w-4 h-4 text-sky-400" />
              Upload Study Document (PDF)
            </h2>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Drag &amp; drop or click to browse • Max 25MB
            </span>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              style={{
                borderColor: dragActive ? "var(--primary)" : "var(--border-color)",
                background: dragActive ? "var(--primary)15" : "var(--bg-secondary)",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--gradient-accent)" }}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="font-bold text-xs sm:text-sm text-emerald-400">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Size: {formatBytes(selectedFile.size)} • Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-xs sm:text-sm" style={{ color: "var(--text-primary)" }}>
                    Drop your PDF here, or <span style={{ color: "var(--primary)" }}>browse files</span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Supports curriculum guides, robotics papers, cheat sheets, and sensor datasheets
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Associated Month
                </label>
                <select
                  value={uploadMonth}
                  onChange={(e) => setUploadMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Month {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  placeholder="e.g. Python Foundations"
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Description / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="e.g. Month 1 Official Syllabus PDF"
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Submit Upload Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                style={{
                  background: "var(--gradient-accent)",
                  color: "#ffffff",
                }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading to Storage...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload to Study Library</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="p-4 rounded-xl border flex flex-col md:flex-row gap-3 md:items-center justify-between"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search documents by name, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs sm:text-sm border outline-none"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Month {i + 1} Documents
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                        color: "var(--primary)",
                      }}
                    >
                      Month {doc.monthNumber}
                    </span>
                    {doc.isOfficial && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Official Curriculum
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatBytes(doc.sizeBytes)}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400 mt-1">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base leading-snug break-all" style={{ color: "var(--text-primary)" }}>
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-sky-400 mt-0.5">
                      {doc.subject}
                    </p>
                    <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {doc.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center justify-between pt-3 border-t text-xs"
                style={{ borderColor: "var(--border-color)" }}
              >
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {/* Read / Preview */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDoc(doc);
                      setZoomLevel(100);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border font-semibold transition-all hover:opacity-80"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                      color: "var(--primary)",
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </button>

                  {/* Download */}
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border font-semibold transition-all hover:opacity-80"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </a>

                  {/* Delete (custom documents only) */}
                  {!doc.isOfficial && (
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 rounded-xl border text-red-400 hover:bg-red-500/10 transition-colors"
                      style={{ borderColor: "var(--border-color)" }}
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocs.length === 0 && (
          <div
            className="p-12 text-center rounded-2xl border space-y-3"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              No study documents found
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Try adjusting your search query or upload a new PDF document.
            </p>
          </div>
        )}

        {/* =========================================================================
            IN-BROWSER PDF VIEWER MODAL
            ========================================================================= */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div
              className="w-full max-w-5xl h-[92vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              {/* PDF Viewer Top Toolbar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {previewDoc.name}
                    </h3>
                    <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                      Month {previewDoc.monthNumber} • {previewDoc.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1 border rounded-lg p-0.5" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                      className="p-1 rounded hover:bg-white/10"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <span className="text-[11px] font-mono px-1.5" style={{ color: "var(--text-primary)" }}>
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                      className="p-1 rounded hover:bg-white/10"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                    </button>
                  </div>

                  {/* Download */}
                  <a
                    href={previewDoc.url}
                    download={previewDoc.name}
                    className="p-2 rounded-xl border hover:opacity-80"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 rounded-xl border hover:bg-red-500/10 text-red-400"
                    style={{ borderColor: "var(--border-color)" }}
                    title="Close Reader"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewport container */}
              <div className="flex-1 w-full h-full overflow-auto bg-slate-950 flex items-center justify-center p-2">
                <iframe
                  src={`${previewDoc.url}#view=FitH&toolbar=1`}
                  title={previewDoc.name}
                  className="w-full h-full rounded-lg border-0"
                  style={{
                    transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : "none",
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease-out",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            DELETE CONFIRMATION DIALOG
            ========================================================================= */}
        {docToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div
              className="w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                    Delete Study Document?
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Are you sure you want to delete <strong className="text-white">{docToDelete.name}</strong> from your library? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

