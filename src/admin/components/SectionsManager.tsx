import { useEffect, useState } from "react";
import { useOutletContext } from 'react-router-dom';
import { supabase } from "../../cms/supabaseClient";

const translations = {
  ru: {
    sectionsManagement: "Управление секциями",
    addSection: "+ Добавить секцию",
    addItem: "+ Добавить элемент",
    sectionKey: "Ключ секции",
    sectionType: "Тип секции",
    order: "Порядок",
    active: "Активна",
    actions: "Действия",
    edit: "✏️",
    delete: "🗑️",
    save: "✓ Сохранить",
    cancel: "✕ Отмена",
    items: "Элементы секции",
    itemType: "Тип элемента",
    contentKey: "Ключ контента",
    iconText: "Иконка/Номер",
    badge: "Badge",
    title: "Заголовок",
    text: "Текст",
    metadata: "Метаданные (JSON)",
    moveUp: "↑",
    moveDown: "↓",
    cssClasses: "CSS классы",
    gridColumns: "Колонок в сетке",
    badgeKeyLabel: "Ключ badge",
    titleKeyLabel: "Ключ заголовка",
    textKeyLabel: "Ключ текста",
    badgeTextLabel: "Текст badge по ключу",
    titleTextLabel: "Текст заголовка по ключу",
    contentTextLabel: "Основной текст по ключу",
    itemFormTitlePrefix: "Редактирование элемента",
  },
  kz: {
    sectionsManagement: "Секцияларды басқару",
    addSection: "+ Секция қосу",
    addItem: "+ Элемент қосу",
    sectionKey: "Секция кілті",
    sectionType: "Секция түрі",
    order: "Реті",
    active: "Белсенді",
    actions: "Әрекеттер",
    edit: "✏️",
    delete: "🗑️",
    save: "✓ Сақтау",
    cancel: "✕ Болдырмау",
    items: "Секция элементтері",
    itemType: "Элемент түрі",
    contentKey: "Контент кілті",
    iconText: "Иконка/Нөмір",
    badge: "Badge",
    title: "Тақырып",
    text: "Мәтін",
    metadata: "Метадеректер (JSON)",
    moveUp: "↑",
    moveDown: "↓",
    cssClasses: "CSS кластары",
    gridColumns: "Торда бағандар",
    badgeKeyLabel: "Badge кілті",
    titleKeyLabel: "Тақырып кілті",
    textKeyLabel: "Мәтін кілті",
    badgeTextLabel: "Badge мәтіні",
    titleTextLabel: "Тақырып мәтіні",
    contentTextLabel: "Негізгі мәтін",
    itemFormTitlePrefix: "Элементті өңдеу",
  },
};

interface SectionItem {
  id: string;
  section_id: string;
  item_type: string;
  content_key_badge?: string;
  content_key_title?: string;
  content_key_text?: string;
  icon_text?: string;
  order_index: number;
  metadata?: any;
}

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  order_index: number;
  is_active: boolean;
  css_classes: string;
  grid_columns?: number;
  items?: SectionItem[];
}



const SECTION_TYPES = ["hero", "features", "cards", "contact", "footer"];
const ITEM_TYPES = [
  "header",
  "card",
  "feature",
  "description",
  "contact_item",
  "hero_card",
  "footer_text",
];

interface TranslationFieldProps {
  itemKey: string;
  contentLang: "ru" | "kz";
  editingKey: string | null;
  editingValue: string;
  onStartEdit: (key: string, value: string) => void;
  onSave: (key: string) => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  triggerReload?: number;
}

function TranslationField({
  itemKey,
  contentLang,
  editingKey,
  editingValue,
  onStartEdit,
  onSave,
  onCancel,
  onChange,
  triggerReload,
}: TranslationFieldProps) {
  const [translation, setTranslation] = useState({ ru: "", kz: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranslation();
  }, [itemKey, contentLang, triggerReload]);

  const loadTranslation = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("translations")
      .select("value_ru, value_kz")
      .eq("key", itemKey)
      .single();

    if (data) {
      setTranslation({
        ru: data.value_ru || "",
        kz: data.value_kz || "",
      });
    }
    setLoading(false);
  };

  const currentValue = contentLang === "ru" ? translation.ru : translation.kz;
  const isEditing = editingKey === itemKey;

  if (loading) {
    return <span className="translation-loading">⏳</span>;
  }

  if (isEditing) {
    return (
      <div className="inline-translation-edit">
        <textarea
          value={editingValue}
          onChange={(e) => onChange(e.target.value)}
          className="inline-edit-textarea"
          autoFocus
        />
        <button onClick={() => onSave(itemKey)} className="btn-save-mini">
          ✓
        </button>
        <button onClick={onCancel} className="btn-cancel-mini">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="inline-translation-view">
      <span className="translation-text">{currentValue || "(пусто)"}</span>
      <button
        onClick={() => onStartEdit(itemKey, currentValue)}
        className="btn-edit-mini"
      >
        ✏️
      </button>
    </div>
  );
}

export default function SectionsManager() {
  const { contentLang, systemLang } = useOutletContext<{
    contentLang: "ru" | "kz";
    systemLang: "ru" | "kz";
  }>();
  const t = translations[systemLang];

  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set()
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [addingItemToSection, setAddingItemToSection] = useState<string | null>(
    null
  );
  const [editingTranslationKey, setEditingTranslationKey] = useState<string | null>(null);
  const [editingTranslationValue, setEditingTranslationValue] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [editSectionData, setEditSectionData] = useState({
    section_key: "",
    section_type: "cards",
    order_index: 0,
    is_active: true,
    css_classes: "section",
    grid_columns: 3,
  });

  const [editItemData, setEditItemData] = useState({
    item_type: "card",
    content_key_badge: "",
    content_key_title: "",
    content_key_text: "",
    icon_text: "",
    order_index: 0,
    metadata: "{}",
  });

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
  const { data: sectionsData } = await supabase
    .from("sections")
    .select("*")
    .order("order_index");
  
  if (!sectionsData) return;

  const sectionsWithItems: Section[] = await Promise.all(
    sectionsData.map(async (section: any) => {
      const { data: items } = await supabase
        .from("section_items")
        .select("*")
        .eq("section_id", section.id)
        .order("order_index");

      const itemsWithValues: SectionItem[] = items || [];
      return { ...section, items: itemsWithValues };
    })
  );

  setSections(sectionsWithItems);
};

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

  

  const startAddSection = () => {
    const maxOrder = Math.max(...sections.map((s) => s.order_index), 0);
    setEditSectionData({
      section_key: `new_section_${maxOrder + 1}`,
      section_type: "cards",
      order_index: maxOrder + 1,
      is_active: true,
      css_classes: "section",
      grid_columns: 3,
    });
    setIsAddingSection(true);
  };

  const addSection = async () => {
    const { error } = await supabase.from("sections").insert(editSectionData);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    setIsAddingSection(false);
    loadSections();
  };

  const startEditSection = (section: Section) => {
    setEditSectionData({
      section_key: section.section_key,
      section_type: section.section_type,
      order_index: section.order_index,
      is_active: section.is_active,
      css_classes: section.css_classes,
      grid_columns: section.grid_columns || 3,
    });
    setEditingSectionId(section.id);
  };

  const saveSection = async (id: string) => {
    const { error } = await supabase
      .from("sections")
      .update(editSectionData)
      .eq("id", id);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    setEditingSectionId(null);
    loadSections();
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Удалить эту секцию и все её элементы?")) return;
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    loadSections();
  };

  const moveSectionUp = async (section: Section) => {
    const prevSection = sections.find(
      (s) => s.order_index === section.order_index - 1
    );
    if (!prevSection) return;
    await supabase
      .from("sections")
      .update({ order_index: section.order_index })
      .eq("id", prevSection.id);
    await supabase
      .from("sections")
      .update({ order_index: prevSection.order_index })
      .eq("id", section.id);
    loadSections();
  };

  const moveSectionDown = async (section: Section) => {
    const nextSection = sections.find(
      (s) => s.order_index === section.order_index + 1
    );
    if (!nextSection) return;
    await supabase
      .from("sections")
      .update({ order_index: section.order_index })
      .eq("id", nextSection.id);
    await supabase
      .from("sections")
      .update({ order_index: nextSection.order_index })
      .eq("id", section.id);
    loadSections();
  };

  

  const startAddItem = (sectionId: string, items: SectionItem[]) => {
    const maxOrder = Math.max(...items.map((i) => i.order_index), -1);
    setEditItemData({
      item_type: "card",
      content_key_badge: "",
      content_key_title: "",
      content_key_text: "",
      icon_text: "",
      order_index: maxOrder + 1,
      metadata: "{}",
    });
    setAddingItemToSection(sectionId);
  };

  const buildMetadataWithValues = () => {
    let meta: any = {};
    try {
      meta = JSON.parse(editItemData.metadata || "{}");
    } catch {
      alert("Неверный JSON в метаданных");
      return null;
    }
    return {
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    };
  };

  const addItem = async (sectionId: string) => {
    const metadata = buildMetadataWithValues();
    if (!metadata) return;

    const { error } = await supabase.from("section_items").insert({
      section_id: sectionId,
      item_type: editItemData.item_type,
      content_key_badge: editItemData.content_key_badge || null,
      content_key_title: editItemData.content_key_title || null,
      content_key_text: editItemData.content_key_text || null,
      icon_text: editItemData.icon_text || null,
      order_index: editItemData.order_index,
      metadata,
    });

    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }

    setAddingItemToSection(null);
    loadSections();
  };

  const startEditItem = (item: SectionItem) => {
    const meta = item.metadata || {};
    setEditItemData({
      item_type: item.item_type,
      content_key_badge: item.content_key_badge || "",
      content_key_title: item.content_key_title || "",
      content_key_text: item.content_key_text || "",
      icon_text: item.icon_text || "",
      order_index: item.order_index,
      metadata: JSON.stringify(meta, null, 2),
    });
    setEditingItemId(item.id);
  };

  const saveItem = async (id: string) => {
    const metadata = buildMetadataWithValues();
    if (!metadata) return;

    const { error } = await supabase
      .from("section_items")
      .update({
        item_type: editItemData.item_type,
        content_key_badge: editItemData.content_key_badge || null,
        content_key_title: editItemData.content_key_title || null,
        content_key_text: editItemData.content_key_text || null,
        icon_text: editItemData.icon_text || null,
        order_index: editItemData.order_index,
        metadata,
      })
      .eq("id", id);

    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }

    setEditingItemId(null);
    loadSections();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Удалить этот элемент?")) return;
    const { error } = await supabase
      .from("section_items")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    loadSections();
  };

  const moveItemUp = async (item: SectionItem, items: SectionItem[]) => {
    const prevItem = items.find(
      (i) => i.order_index === item.order_index - 1
    );
    if (!prevItem) return;
    await supabase
      .from("section_items")
      .update({ order_index: item.order_index })
      .eq("id", prevItem.id);
    await supabase
      .from("section_items")
      .update({ order_index: prevItem.order_index })
      .eq("id", item.id);
    loadSections();
  };

  const moveItemDown = async (item: SectionItem, items: SectionItem[]) => {
    const nextItem = items.find(
      (i) => i.order_index === item.order_index + 1
    );
    if (!nextItem) return;
    await supabase
      .from("section_items")
      .update({ order_index: item.order_index })
      .eq("id", nextItem.id);
    await supabase
      .from("section_items")
      .update({ order_index: nextItem.order_index })
      .eq("id", item.id);
    loadSections();
  };

  const startEditTranslation = async (key: string, currentValue: string) => {
    setEditingTranslationKey(key);
    setEditingTranslationValue(currentValue);
  };

  const saveTranslation = async (key: string) => {
  const column = contentLang === "ru" ? "value_ru" : "value_kz";
  
  const { error } = await supabase
    .from("translations")
    .update({ [column]: editingTranslationValue })
    .eq("key", key);

  if (error) {
    alert("Ошибка: " + error.message);
    return;
  }
  
  setEditingTranslationKey(null);
  setReloadTrigger(prev => prev + 1);
};

  return (
    <div className="sections-manager">
      <div className="page-header">
        <h2>{t.sectionsManagement}</h2>

        <button onClick={startAddSection} className="btn-add">
          {t.addSection}
        </button>
      </div>


      <div className="sections-list">
        {isAddingSection && (
          <div className="section-form">
            <h3 style={{ 
              marginBottom: '20px', 
              fontSize: '18px', 
              color: '#1e293b',
              fontWeight: 600 
            }}>
              Новая секция
            </h3>
    
            <div className="form-grid">
              <div>
                <label>{t.sectionKey}</label>
                <input
                  type="text"
                  value={editSectionData.section_key}
                  onChange={(e) =>
                    setEditSectionData({
                      ...editSectionData,
                      section_key: e.target.value,
                    })
                  }
                  placeholder="about"
                />
              </div>

              <div>
                <label>{t.sectionType}</label>
                <select
                  value={editSectionData.section_type}
                  onChange={(e) =>
                    setEditSectionData({
                      ...editSectionData,
                      section_type: e.target.value,
                    })
                  }
                >
                  {SECTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>{t.order}</label>
                <input
                  type="number"
                  value={editSectionData.order_index}
                  onChange={(e) =>
                    setEditSectionData({
                      ...editSectionData,
                      order_index: Number(e.target.value),
                    })
                  }
                />
              </div>
        
              <div>
                <label>{t.cssClasses}</label>
                <input
                  type="text"
                  value={editSectionData.css_classes}
                  onChange={(e) =>
                    setEditSectionData({
                      ...editSectionData,
                      css_classes: e.target.value,
                    })
                  }
                  placeholder="section"
                />
              </div>
        
              <div>
                <label>{t.gridColumns}</label>
                <input
                  type="number"
                  value={editSectionData.grid_columns}
                  onChange={(e) =>
                    setEditSectionData({
                      ...editSectionData,
                      grid_columns: Number(e.target.value),
                    })
                  }
                  min="1"
                  max="12"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={editSectionData.is_active}
                    onChange={(e) =>
                      setEditSectionData({
                        ...editSectionData,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  {t.active}
                </label>
              </div>
            </div>

            <div className="section-actions">
              <button onClick={addSection} className="btn-save">
                {t.save}
              </button>
              <button
                onClick={() => setIsAddingSection(false)}
                className="btn-cancel"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {sections.map((section, idx) => {
          const isExpanded = expandedSections.has(section.id);
          const isEditing = editingSectionId === section.id;

          return (
            <div key={section.id} className="section-card">
              <div
                className="section-header-row"
                onClick={() => toggleSection(section.id)}
                style={{ cursor: "pointer" }}
              >
                <span>
                  {section.section_key} ({section.section_type}) #
                  {section.order_index}{" "}
                  {!section.is_active && <span>— неактивна</span>}
                </span>
                <span>{isExpanded ? "▼" : "▶"}</span>
              </div>

              {isExpanded && (
                <div className="section-content">
                  {isEditing ? (
                    <div className="section-form">
                      <div className="form-grid">
                        <div>
                          <label>{t.sectionKey}</label>
                          <input
                            value={editSectionData.section_key}
                            onChange={(e) =>
                              setEditSectionData({
                                ...editSectionData,
                                section_key: e.target.value,
                              })
                            }
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label>{t.sectionType}</label>
                          <select
                            value={editSectionData.section_type}
                            onChange={(e) =>
                              setEditSectionData({
                                ...editSectionData,
                                section_type: e.target.value,
                              })
                            }
                            className="form-input"
                          >
                            {SECTION_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label>{t.order}</label>
                          <input
                            type="number"
                            value={editSectionData.order_index}
                            onChange={(e) =>
                              setEditSectionData({
                                ...editSectionData,
                                order_index: Number(e.target.value),
                              })
                            }
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label>{t.cssClasses}</label>
                          <input
                            value={editSectionData.css_classes}
                            onChange={(e) =>
                              setEditSectionData({
                                ...editSectionData,
                                css_classes: e.target.value,
                              })
                            }
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label>{t.gridColumns}</label>
                          <input
                            type="number"
                            value={editSectionData.grid_columns}
                            onChange={(e) =>
                              setEditSectionData({
                                ...editSectionData,
                                grid_columns: Number(e.target.value),
                              })
                            }
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label>{t.active}</label>
                          <input
                            type="checkbox"
                            checked={editSectionData.is_active}
                            onChange={(e) =>
                              setEditSectionData({
                                ...editSectionData,
                                is_active: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="section-actions">
                        <button
                          onClick={() => saveSection(section.id)}
                          className="btn-save"
                        >
                          {t.save}
                        </button>
                        <button
                          onClick={() => setEditingSectionId(null)}
                          className="btn-cancel"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="section-actions">
                      <button
                        onClick={() => startEditSection(section)}
                        className="btn-icon btn-edit"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="btn-icon delete"
                      >
                        {t.delete}
                      </button>
                      {idx > 0 && (
                        <button
                          onClick={() => moveSectionUp(section)}
                          className="btn-icon"
                        >
                          {t.moveUp}
                        </button>
                      )}
                      {idx < sections.length - 1 && (
                        <button
                          onClick={() => moveSectionDown(section)}
                          className="btn-icon"
                        >
                          {t.moveDown}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          startAddItem(section.id, section.items || [])
                        }
                        className="btn-add"
                        style={{ marginLeft: "auto" }}
                      >
                        {t.addItem}
                      </button>
                    </div>
                  )}

                  <h3 className="category-title" style={{ marginTop: 16 }}>
                    {t.items}
                  </h3>

                  {}
                  {addingItemToSection === section.id && (
                    <div className="item-card">
                      <div className="item-form">
                        <div className="item-form-title">
                          {t.itemFormTitlePrefix}: {section.section_key} · new
                        </div>

                        <div className="form-grid">
                          <div>
                            <label>{t.itemType}</label>
                            <select
                              value={editItemData.item_type}
                              onChange={(e) =>
                                setEditItemData({
                                  ...editItemData,
                                  item_type: e.target.value,
                                })
                              }
                              className="form-input"
                            >
                              {ITEM_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label>{t.badgeKeyLabel}</label>
                            <input
                              placeholder="values.items.v1.badge"
                              value={editItemData.content_key_badge}
                              onChange={(e) =>
                                setEditItemData({
                                  ...editItemData,
                                  content_key_badge: e.target.value,
                                })
                              }
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label>{t.titleKeyLabel}</label>
                            <input
                              placeholder="values.items.v1.title"
                              value={editItemData.content_key_title}
                              onChange={(e) =>
                                setEditItemData({
                                  ...editItemData,
                                  content_key_title: e.target.value,
                                })
                              }
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label>{t.textKeyLabel}</label>
                            <input
                              placeholder="values.items.v1.text"
                              value={editItemData.content_key_text}
                              onChange={(e) =>
                                setEditItemData({
                                  ...editItemData,
                                  content_key_text: e.target.value,
                                })
                              }
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label>{t.iconText}</label>
                            <input
                              placeholder="01"
                              value={editItemData.icon_text}
                              onChange={(e) =>
                                setEditItemData({
                                  ...editItemData,
                                  icon_text: e.target.value,
                                })
                              }
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label>{t.order}</label>
                            <input
                              type="number"
                              value={editItemData.order_index}
                              onChange={(e) =>
                                setEditItemData({
                                  ...editItemData,
                                  order_index: Number(e.target.value),
                                })
                              }
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div>
                          <label>{t.metadata}</label>
                          <textarea
                            value={editItemData.metadata}
                            onChange={(e) =>
                              setEditItemData({
                                ...editItemData,
                                metadata: e.target.value,
                              })
                            }
                            className="form-input"
                            style={{
                              width: "100%",
                              minHeight: 120,
                              marginTop: 8,
                            }}
                          />
                        </div>

                        <div className="section-actions">
                          <button
                            onClick={() => addItem(section.id)}
                            className="btn-save"
                          >
                            {t.save}
                          </button>
                          <button
                            onClick={() => setAddingItemToSection(null)}
                            className="btn-cancel"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {}
                  <div className="items-list">
                    {(section.items || []).map((item, itemIdx) => {
                      const isEditingItem = editingItemId === item.id;

                      if (isEditingItem) {
                        return (
                          <div key={item.id} className="item-card">
                            <div className="item-form">
                              <div className="item-form-title">
                                {t.itemFormTitlePrefix}: {section.section_key} ·{" "}
                                {item.item_type} ·{" "}
                                {item.content_key_title ||
                                  item.content_key_text ||
                                  item.id}
                              </div>

                              <div className="form-grid">
                                <div>
                                  <label>{t.itemType}</label>
                                  <select
                                    value={editItemData.item_type}
                                    onChange={(e) =>
                                      setEditItemData({
                                        ...editItemData,
                                        item_type: e.target.value,
                                      })
                                    }
                                    className="form-input"
                                  >
                                    {ITEM_TYPES.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label>{t.badgeKeyLabel}</label>
                                  <input
                                    placeholder="values.items.v1.badge"
                                    value={editItemData.content_key_badge}
                                    onChange={(e) =>
                                      setEditItemData({
                                        ...editItemData,
                                        content_key_badge: e.target.value,
                                      })
                                    }
                                    className="form-input"
                                  />
                                </div>

                                <div>
                                  <label>{t.titleKeyLabel}</label>
                                  <input
                                    placeholder="values.items.v1.title"
                                    value={editItemData.content_key_title}
                                    onChange={(e) =>
                                      setEditItemData({
                                        ...editItemData,
                                        content_key_title: e.target.value,
                                      })
                                    }
                                    className="form-input"
                                  />
                                </div>

                                <div>
                                  <label>{t.textKeyLabel}</label>
                                  <input
                                    placeholder="values.items.v1.text"
                                    value={editItemData.content_key_text}
                                    onChange={(e) =>
                                      setEditItemData({
                                        ...editItemData,
                                        content_key_text: e.target.value,
                                      })
                                    }
                                    className="form-input"
                                  />
                                </div>

                                <div>
                                  <label>{t.iconText}</label>
                                  <input
                                    placeholder="01"
                                    value={editItemData.icon_text}
                                    onChange={(e) =>
                                      setEditItemData({
                                        ...editItemData,
                                        icon_text: e.target.value,
                                      })
                                    }
                                    className="form-input"
                                  />
                                </div>

                                <div>
                                  <label>{t.order}</label>
                                  <input
                                    type="number"
                                    value={editItemData.order_index}
                                    onChange={(e) =>
                                      setEditItemData({
                                        ...editItemData,
                                        order_index: Number(e.target.value),
                                      })
                                    }
                                    className="form-input"
                                  />
                                </div>
                              </div>

                              <div>
                                <label>{t.metadata}</label>
                                <textarea
                                  value={editItemData.metadata}
                                  onChange={(e) =>
                                    setEditItemData({
                                      ...editItemData,
                                      metadata: e.target.value,
                                    })
                                  }
                                  className="form-input"
                                  style={{
                                    width: "100%",
                                    minHeight: 120,
                                    marginTop: 8,
                                  }}
                                />
                              </div>

                              <div className="section-actions">
                                <button
                                  onClick={() => saveItem(item.id)}
                                  className="btn-save"
                                >
                                  {t.save}
                                </button>
                                <button
                                  onClick={() => setEditingItemId(null)}
                                  className="btn-cancel"
                                >
                                  {t.cancel}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={item.id} className="item-card">
                          <div className="item-header-row">
                            <div className="item-info">
                              <strong>{item.item_type}</strong>
                              {item.icon_text && <span>🎨 {item.icon_text}</span>}
                              {item.content_key_title && (
                                <span>📝 {item.content_key_title}</span>
                              )}
                              {item.content_key_text && (
                                <span>{item.content_key_text}</span>
                              )}
                                <span>#{item.order_index}</span>
                            </div>

                            <div className="item-actions">
                              <button
                                onClick={() => startEditItem(item)}
                                className="btn-icon btn-edit"
                              >
                                {t.edit}
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="btn-icon delete"
                              >
                                {t.delete}
                              </button>
                            {itemIdx > 0 && (
                              <button
                                onClick={() => moveItemUp(item, section.items || [])}
                                className="btn-icon"
                              >
                                {t.moveUp}
                              </button>
                            )}
                            {itemIdx < (section.items?.length || 0) - 1 && (
                              <button
                                onClick={() => moveItemDown(item, section.items || [])}
                                className="btn-icon"
                              >
                                {t.moveDown}
                              </button>
                            )}
                          </div>
                        </div>

                        {(item.content_key_title || item.content_key_text || item.content_key_badge) && (
                          <div className="item-translations">
                            {item.content_key_badge && (
                              <div className="translation-item-inline">
                                <span className="translation-label">Badge:</span>
                                  <TranslationField
                                    itemKey={item.content_key_badge}
                                    contentLang={contentLang}
                                    editingKey={editingTranslationKey}
                                    editingValue={editingTranslationValue}
                                    onStartEdit={startEditTranslation}
                                    onSave={saveTranslation}
                                    onCancel={() => setEditingTranslationKey(null)}
                                    onChange={setEditingTranslationValue}
                                    triggerReload={reloadTrigger} 
                                  />
                                </div>
                              )}
                              {item.content_key_title && (
                                <div className="translation-item-inline">
                                  <span className="translation-label">Заголовок:</span>
                                  <TranslationField
                                    itemKey={item.content_key_title}
                                    contentLang={contentLang}
                                    editingKey={editingTranslationKey}
                                    editingValue={editingTranslationValue}
                                    onStartEdit={startEditTranslation}
                                    onSave={saveTranslation}
                                    onCancel={() => setEditingTranslationKey(null)}
                                    onChange={setEditingTranslationValue}
                                    triggerReload={reloadTrigger} 
                                  />
                                </div>
                              )}
                              {item.content_key_text && (
                                <div className="translation-item-inline">
                                  <span className="translation-label">Текст:</span>
                                  <TranslationField
                                    itemKey={item.content_key_text}
                                    contentLang={contentLang}
                                    editingKey={editingTranslationKey}
                                                          editingValue={editingTranslationValue}
                                    onStartEdit={startEditTranslation}
                                    onSave={saveTranslation}
                                    onCancel={() => setEditingTranslationKey(null)}
                                    onChange={setEditingTranslationValue}
                                    triggerReload={reloadTrigger} 
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
