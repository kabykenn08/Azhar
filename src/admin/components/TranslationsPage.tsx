import { useEffect, useState } from "react";
import { useOutletContext } from 'react-router-dom';
import { supabase } from "../../cms/supabaseClient";

const translations = {
  ru: {
    translations: "Переводы",
    search: "Поиск по ключу...",
    edit: "Редактировать",
    save: "✓ Сохранить",
    cancel: "✕ Отмена",
    empty: "(пусто)",
  },
  kz: {
    translations: "Аудармалар",
    search: "Кілт бойынша іздеу...",
    edit: "Өңдеу",
    save: "✓ Сақтау",
    cancel: "✕ Болдырмау",
    empty: "(бос)",
  },
};

interface Translation {
  id: string;
  key: string;
  value_ru: string;
  value_kz: string;
}

export default function TranslationsPage() {
  
  const { contentLang, systemLang, setTotalKeys } = useOutletContext<{
    contentLang: "ru" | "kz";
    systemLang: "ru" | "kz";
    setTotalKeys: (count: number) => void;
  }>();

  const t = translations[systemLang];
  const [translationsList, setTranslationsList] = useState<Translation[]>([]);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .order("key");

    if (!error && data) {
      setTranslationsList(data);
      setTotalKeys(data.length); 
    }
  };

  const startEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue || "");
  };

  const saveEdit = async (id: string) => {
    const column = contentLang === "ru" ? "value_ru" : "value_kz";
    
    const { error } = await supabase
      .from("translations")
      .update({ [column]: editValue })
      .eq("id", id);

    if (error) {
      console.error("❌ Ошибка сохранения:", error);
      alert("Ошибка сохранения: " + error.message);
    } else {
      console.log("✅ Сохранено успешно");
      setEditingId(null);
      
      setTranslationsList(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, [column]: editValue }
            : item
        )
      );
    }
  };

  const filteredTranslations = translationsList.filter((t) =>
    t.key.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = filteredTranslations.reduce((acc, t) => {
    const category = t.key.split(".")[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(t);
    return acc;
  }, {} as Record<string, Translation[]>);

  const categoryOrder = ["header", "hero", "about", "services", "values", "contact", "footer"];
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="translations-page">
      <div className="width-placeholder" aria-hidden="true"></div>
      
      <div className="page-header">
        <h2>{t.translations} ({contentLang.toUpperCase()})</h2>
        <input
          type="text"
          placeholder={t.search}
          className="search-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {sortedCategories.map((category) => (
        <div key={category} className="category-section">
          <div className="width-placeholder" aria-hidden="true"></div>
          
          <h3 className="category-title">{category}</h3>
          <div className="translations-list">
            {grouped[category].map((item) => {
              const value = contentLang === "ru" ? item.value_ru : item.value_kz;
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} className="translation-item">
                  <div className="translation-key">{item.key}</div>
                  {isEditing ? (
                    <div className="translation-edit">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-textarea"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="btn-save"
                      >
                        {t.save}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <div className="translation-value">
                      <span>{value || t.empty}</span>
                      <button
                        onClick={() => startEdit(item.id, value)}
                        className="btn-edit"
                      >
                        {t.edit}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}