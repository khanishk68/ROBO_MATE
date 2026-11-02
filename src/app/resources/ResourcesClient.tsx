// src/app/resources/ResourcesClient.tsx
"use client";
import React, { useState } from "react";
import {
  BookOpen, Plus, Search, ExternalLink, Bookmark,
  FileText, Video, Globe, Image as ImageIcon, Trash2, Tag
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { useTheme } from "@/contexts/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import type { StudyResource, ResourceType } from "@/types/database";

interface ResourcesClientProps {
  userId: string;
  initialResources: StudyResource[];
  modules: { id: string; title: string }[];
}

const CURATED_DEFAULT_RESOURCES: Omit<StudyResource, "id" | "created_at" | "updated_at">[] = [
  // Robotics Engineering resources
  {
    owner_id: "boy",
    module_id: null,
    title: "ROS 2 Humble Official Documentation & Tutorials",
    description: "Core reference for rclcpp, rclpy, launch files, parameter services, and DDS configuration.",
    resource_type: "website",
    resource_url: "https://docs.ros.org/en/humble/",
    file_path: null,
    tags: ["ROS 2", "Robotics", "Linux"],
  },
  {
    owner_id: "boy",
    module_id: null,
    title: "Probabilistic Robotics by Thrun, Burgard, Fox",
    description: "The bible of SLAM, Kalman Filtering, EKF, and autonomous probabilistic localization.",
    resource_type: "book",
    resource_url: "https://mitpress.mit.edu/9780262201629/probabilistic-robotics/",
    file_path: null,
    tags: ["SLAM", "Algorithms", "Math"],
  },
  {
    owner_id: "boy",
    module_id: null,
    title: "Articulated Robotics - Complete ROS 2 Mobile Robot Series",
    description: "Step-by-step YouTube masterclass on building a physical differential drive mobile robot.",
    resource_type: "youtube",
    resource_url: "https://www.youtube.com/@ArticulatedRobotics",
    file_path: null,
    tags: ["Hardware", "Tutorial", "URDF"],
  },

  // Industrial Design resources
  {
    owner_id: "girl",
    module_id: null,
    title: "How to Draw: Drawing and Sketching Objects and Environments",
    description: "Scott Robertson's definitive guide on perspective, vanishing points, and construction drawing.",
    resource_type: "book",
    resource_url: "https://designstudiopress.com",
    file_path: null,
    tags: ["Sketching", "Perspective", "Foundation"],
  },
  {
    owner_id: "girl",
    module_id: null,
    title: "Autodesk Fusion 360 Parametric CAD Best Practices",
    description: "Guidelines on robust sketch constraints, top-down assembly modeling, and joint tolerances.",
    resource_type: "tutorial",
    resource_url: "https://help.autodesk.com/view/fusion360/ENU/",
    file_path: null,
    tags: ["CAD", "Fusion 360", "Parametric"],
  },
  {
    owner_id: "girl",
    module_id: null,
    title: "Design for Manufacturing (DFM) Plastic Injection Molding Guide",
    description: "Draft angles, wall thickness consistency, boss designs, and rib structural ratios.",
    resource_type: "pdf",
    resource_url: "https://protolabs.com/resources/design-tips/",
    file_path: null,
    tags: ["DFM", "Materials", "Injection Molding"],
  },
];

export function ResourcesClient({ userId, initialResources, modules }: ResourcesClientProps) {
  const { isBoyMode } = useTheme();
  const { success, error: showError } = useToast();
  const supabase = createClient();

  const [resources, setResources] = useState<StudyResource[]>(
    initialResources.length > 0
      ? initialResources
      : CURATED_DEFAULT_RESOURCES.map((r, i) => ({
          ...r,
          id: `res-${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New resource form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ResourceType>("website");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newModuleId, setNewModuleId] = useState("");

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "all" || r.resource_type === selectedType;

    return matchesSearch && matchesType;
  });

  async function handleAddResource() {
    if (!newTitle.trim()) {
      showError("Please enter a title");
      return;
    }

    const tagList = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newRes: StudyResource = {
      id: `res-${Date.now()}`,
      owner_id: userId,
      module_id: newModuleId || null,
      title: newTitle,
      description: newDesc || null,
      resource_type: newType,
      resource_url: newUrl || null,
      file_path: null,
      tags: tagList,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("study_resources").insert({
      owner_id: userId,
      module_id: newModuleId || null,
      title: newTitle,
      description: newDesc || null,
      resource_type: newType,
      resource_url: newUrl || null,
      tags: tagList,
    }).select().single();

    if (!error && data) {
      setResources((prev) => [data, ...prev]);
    } else {
      setResources((prev) => [newRes, ...prev]);
    }

    success("Resource saved to library!");
    setShowAddModal(false);
    setNewTitle("");
    setNewUrl("");
    setNewDesc("");
    setNewTags("");
  }

  function getIcon(type: ResourceType) {
    switch (type) {
      case "book":
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-red-400" />;
      case "youtube":
      case "tutorial":
        return <Video className="w-4 h-4 text-pink-400" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <Globe className="w-4 h-4 text-sky-400" />;
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-6xl mx-auto pb-16 w-full min-w-0">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            Study Library &amp; Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Curated textbooks, whitepapers, tutorials, and CAD references for our robotics journey.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAddModal(true)} className="self-start sm:self-auto font-bold text-xs">
          <Plus className="w-4 h-4 mr-1" /> Save Resource
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by title, topic, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 text-xs sm:text-sm w-full"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
          {["all", "book", "pdf", "website", "youtube", "tutorial"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: selectedType === type ? "var(--primary)" : "var(--bg-secondary)",
                color: selectedType === type ? "white" : "var(--text-muted)",
                border: "1px solid var(--border-color)",
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <Card key={res.id} hover className="flex flex-col justify-between">
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                    {getIcon(res.resource_type)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {res.resource_type}
                  </span>
                </div>

                {res.resource_url && (
                  <a
                    href={res.resource_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ color: "var(--primary)" }}
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
                  {res.title}
                </h3>
                {res.description && (
                  <p className="text-xs mt-1.5 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                    {res.description}
                  </p>
                )}
              </div>

              {res.tags && res.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Save Resource to Knowledge Base"
        size="md"
      >
        <div className="p-5 space-y-4">
          <Input
            label="Resource Title *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. ROS 2 Navigation Tuning Guide"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Resource Type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as ResourceType)}
              options={[
                { value: "website", label: "Website / Docs" },
                { value: "book", label: "Textbook / E-book" },
                { value: "pdf", label: "PDF / Whitepaper" },
                { value: "youtube", label: "YouTube Video" },
                { value: "tutorial", label: "Interactive Tutorial" },
                { value: "note", label: "Personal Engineering Note" },
              ]}
            />

            <Select
              label="Linked Module (optional)"
              value={newModuleId}
              onChange={(e) => setNewModuleId(e.target.value)}
              options={[
                { value: "", label: "General Knowledge" },
                ...modules.map((m) => ({ value: m.id, label: m.title })),
              ]}
            />
          </div>

          <Input
            label="URL or Repository Link"
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
          />

          <Textarea
            label="Description / Key Takeaways"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Why is this resource valuable for your robotics work?"
            rows={2}
          />

          <Input
            label="Tags (comma-separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="ROS2, Nav2, C++, CAD, DFM"
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddResource} className="flex-1">
              Save Resource
            </Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

