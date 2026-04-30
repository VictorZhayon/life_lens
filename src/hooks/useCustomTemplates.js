import { useState, useCallback, useEffect } from 'react';
import {
  addTemplate as addTemplateToFirestore,
  getAllTemplates,
  updateTemplateDoc,
  deleteTemplateDoc
} from '../services/firestore';

export function useCustomTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load templates from Firestore on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAllTemplates();
        if (!cancelled) setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const addTemplate = useCallback(async (template) => {
    const newTemplate = {
      ...template,
      createdAt: new Date().toISOString()
    };
    try {
      const saved = await addTemplateToFirestore(newTemplate);
      setTemplates(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.error('Failed to save template:', err);
      throw err;
    }
  }, []);

  const updateTemplate = useCallback(async (id, data) => {
    try {
      await updateTemplateDoc(id, data);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    } catch (err) {
      console.error('Failed to update template:', err);
    }
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    try {
      await deleteTemplateDoc(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  }, []);

  /**
   * Get custom prompts for a given area + review type.
   * Returns null if no custom template exists (fall back to defaults).
   */
  const getCustomPrompts = useCallback((areaId, reviewType) => {
    const template = templates.find(
      t => t.area === areaId && t.reviewType === reviewType && t.enabled !== false
    );
    return template ? template.prompts : null;
  }, [templates]);

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getCustomPrompts
  };
}

export default useCustomTemplates;
