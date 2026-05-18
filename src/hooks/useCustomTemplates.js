import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  addTemplate as addTemplateToFirestore, getAllTemplates,
  updateTemplateDoc, deleteTemplateDoc
} from '../services/firestore';

export function useCustomTemplates() {
  const { userId } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;
    async function load() {
      try {
        const data = await getAllTemplates(userId);
        if (!cancelled) setTemplates(data);
      } catch (err) { console.error('Failed to load templates:', err); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const addTemplate = useCallback(async (template) => {
    if (!userId) throw new Error('Not authenticated');
    const saved = await addTemplateToFirestore(userId, { ...template, createdAt: new Date().toISOString() });
    setTemplates(prev => [saved, ...prev]);
    return saved;
  }, [userId]);

  const updateTemplate = useCallback(async (id, data) => {
    if (!userId) return;
    await updateTemplateDoc(userId, id, data);
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, [userId]);

  const deleteTemplate = useCallback(async (id) => {
    if (!userId) return;
    await deleteTemplateDoc(userId, id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [userId]);

  const getCustomPrompts = useCallback((areaId, reviewType) => {
    const template = templates.find(t => t.area === areaId && t.reviewType === reviewType && t.enabled !== false);
    return template ? template.prompts : null;
  }, [templates]);

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate, getCustomPrompts };
}

export default useCustomTemplates;
