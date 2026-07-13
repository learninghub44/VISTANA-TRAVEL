"use client";

import { useState } from "react";
import { saveBlogAction, deleteBlogAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info } from "lucide-react";
import { Blog } from "@/services/db/types";

interface BlogManagerProps {
  blogs: Blog[];
}

export default function BlogManager({ blogs }: BlogManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Blog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({
      title: "",
      slug: "",
      content: "",
      category: "Travel Guide",
      author: "Vistana Team",
      image_url: "",
    });
    setError("");
  };

  const handleOpenEdit = (b: Blog) => {
    setEditItem({ ...b });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setLoading(true);
    const res = await deleteBlogAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const res = await saveBlogAction({
      title: editItem.title || "",
      slug: editItem.slug || "",
      content: editItem.content || "",
      category: editItem.category || "Travel Guide",
      author: editItem.author || "Vistana Team",
      image_url: editItem.image_url || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save blog post.");
    } else {
      setEditItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-855 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blog posts..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Blog Post</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No blog posts yet. Add one to publish to the journal.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div className="p-5 space-y-2">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded font-bold uppercase">
                  {b.category}
                </span>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white line-clamp-2">{b.title}</h3>
                <p className="text-[10px] text-slate-450">By {b.author}</p>
              </div>

              <div className="flex bg-slate-50/50 dark:bg-slate-955/10 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 dark:border-slate-800/80 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="w-1/2 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-850 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-6">
              {editItem.id ? "Edit Blog Post" : "Create Blog Post"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Title</label>
                <input
                  type="text"
                  required
                  value={editItem.title || ""}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                  placeholder="e.g. 5 Best Times to Visit the Maasai Mara"
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Category</label>
                  <input
                    type="text"
                    required
                    value={editItem.category || ""}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    placeholder="Travel Guide, News..."
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Author</label>
                  <input
                    type="text"
                    required
                    value={editItem.author || ""}
                    onChange={(e) => setEditItem({ ...editItem, author: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Cover Image URL</label>
                <input
                  type="text"
                  value={editItem.image_url || ""}
                  onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Content</label>
                <textarea
                  required
                  value={editItem.content || ""}
                  onChange={(e) => setEditItem({ ...editItem, content: e.target.value })}
                  placeholder="Write the full post..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-205 h-40 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 rounded-xl text-xs flex items-center space-x-1 border border-red-500/10">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-xs cursor-pointer"
              >
                {loading ? "Saving Post..." : "Save Blog Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
