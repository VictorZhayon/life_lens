import { useState } from 'react';
import { useCustomTemplates } from '../../hooks/useCustomTemplates';
import { lifeAreas, reviewTypes } from '../../data/lifeAreas';

export default function TemplateManager() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useCustomTemplates();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', area: '', reviewType: '', prompts: ['', '', '', '', '', ''] });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const resetForm = () => {
    setForm({ name: '', area: '', reviewType: '', prompts: ['', '', '', '', '', ''] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (template) => {
    setForm({
      name: template.name,
      area: template.area,
      reviewType: template.reviewType,
      prompts: [...(template.prompts || []), '', '', '', '', '', ''].slice(0, 6)
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const trimmedPrompts = form.prompts.filter(p => p.trim());
    if (!form.name || !form.area || !form.reviewType || trimmedPrompts.length === 0) return;

    const data = { ...form, prompts: trimmedPrompts };

    if (editingId) {
      await updateTemplate(editingId, data);
    } else {
      await addTemplate(data);
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      await deleteTemplate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const areaMap = {};
  lifeAreas.forEach(a => { areaMap[a.id] = a; });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Review Templates</h1>
          <p className="text-sm text-slate-400 mt-1">Create custom prompts for your reviews</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
          + New Template
        </button>
      </div>

      {/* Template Form */}
      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <h3 className="text-lg font-semibold text-slate-200">{editingId ? 'Edit Template' : 'Create Template'}</h3>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Template Name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Deep Reflection"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Life Area</label>
              <select value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="">Select area...</option>
                {lifeAreas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Review Type</label>
              <select value={form.reviewType} onChange={e => setForm(p => ({ ...p, reviewType: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="">Select type...</option>
                {reviewTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Custom Prompts (1-6)</label>
            <div className="space-y-2">
              {form.prompts.map((prompt, idx) => (
                <input key={idx} type="text" value={prompt}
                  onChange={e => { const p = [...form.prompts]; p[idx] = e.target.value; setForm(prev => ({ ...prev, prompts: p })); }}
                  placeholder={`Prompt ${idx + 1}`}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm}
              className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:border-slate-600 text-sm">Cancel</button>
            <button onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-400 transition-all">
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-400">No custom templates yet. Create one to personalize your reviews!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => {
            const area = areaMap[t.area];
            return (
              <div key={t.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {area && <span className="text-xs" style={{ color: area.color }}>{area.icon} {area.name.split(' ')[0]}</span>}
                      <span className="text-xs text-slate-500">· {t.reviewType}</span>
                      <span className="text-xs text-slate-500">· {t.prompts?.length || 0} prompts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(t)} className="text-xs px-3 py-1.5 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(t.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${deleteConfirm === t.id ? 'bg-red-500 text-white' : 'text-red-400 border border-red-500/30 hover:bg-red-500/10'}`}>
                      {deleteConfirm === t.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
