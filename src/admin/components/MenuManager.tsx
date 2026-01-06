import { useEffect, useState } from "react";
import { useOutletContext } from 'react-router-dom';
import { supabase } from "../../cms/supabaseClient";

const translations = {
  ru: {
    menuManagement: "Управление меню",
    addMenuItem: "+ Добавить пункт меню",
    addSubItem: "+ Добавить подпункт",
    menuKey: "Ключ",
    textRu: "Текст (RU)",
    textKz: "Текст (KZ)",
    url: "URL",
    order: "Порядок",
    actions: "Действия",
    edit: "✏️",
    delete: "🗑️",
    save: "✓ Сохранить",
    cancel: "✕ Отмена",
    mainItems: "Основные пункты",
    subItems: "Подпункты",
  },
  kz: {
    menuManagement: "Мәзір басқару",
    addMenuItem: "+ Мәзір пунктін қосу",
    addSubItem: "+ Ішкі пунктін қосу",
    menuKey: "Кілт",
    textRu: "Мәтін (RU)",
    textKz: "Мәтін (KZ)",
    url: "URL",
    order: "Реті",
    actions: "Әрекеттер",
    edit: "✏️",
    delete: "🗑️",
    save: "✓ Сақтау",
    cancel: "✕ Болдырмау",
    mainItems: "Негізгі пункттер",
    subItems: "Ішкі пункттер",
  },
};

interface MenuItem {
  id: string;
  key: string;
  order_index: number;
  parent_id: string | null;
  url: string;
  is_active: boolean;
}

export default function MenuManager() {
  
  const { systemLang } = useOutletContext<{
    contentLang: "ru" | "kz";
    systemLang: "ru" | "kz";
  }>();

  const t = translations[systemLang];
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ 
    key: "", 
    url: "", 
    order_index: 0,
    text_ru: "",
    text_kz: ""
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addingParentId, setAddingParentId] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({ 
    key: "", 
    url: "", 
    order_index: 0,
    text_ru: "",
    text_kz: ""
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("order_index");

    if (!error && data) {
      setMenuItems(data);
    }
  };

  const startEdit = async (item: MenuItem) => {
    const { data } = await supabase
      .from("translations")
      .select("value_ru, value_kz")
      .eq("key", item.key)
      .single();

    setEditingId(item.id);
    setEditData({
      key: item.key,
      url: item.url,
      order_index: item.order_index,
      text_ru: data?.value_ru || "",
      text_kz: data?.value_kz || "",
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error: menuError } = await supabase
        .from("menu_items")
        .update({ 
          key: editData.key, 
          url: editData.url, 
          order_index: editData.order_index 
        })
        .eq("id", id);

      if (menuError) {
        console.error("Ошибка обновления меню:", menuError);
        alert("Ошибка обновления меню: " + menuError.message);
        return;
      }

      const { error: transError } = await supabase
        .from("translations")
        .update({
          value_ru: editData.text_ru,
          value_kz: editData.text_kz,
        })
        .eq("key", editData.key);

      if (transError) {
        console.error("Ошибка обновления перевода:", transError);
        alert("Ошибка обновления перевода: " + transError.message);
        return;
      }

      setEditingId(null);
      loadMenuItems();
    } catch (err) {
      console.error("Непредвиденная ошибка:", err);
      alert("Произошла ошибка при сохранении");
    }
  };

  const deleteItem = async (id: string, key: string) => {
    if (!confirm("Удалить этот пункт меню и его перевод?")) return;

    try {
      const { error: menuError } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (menuError) {
        console.error("Ошибка удаления пункта:", menuError);
        alert("Ошибка удаления пункта: " + menuError.message);
        return;
      }

      await supabase
        .from("translations")
        .delete()
        .eq("key", key);

      loadMenuItems();
    } catch (err) {
      console.error("Непредвиденная ошибка:", err);
      alert("Произошла ошибка при удалении");
    }
  };

  const startAdding = (parentId: string | null = null) => {
    setIsAdding(true);
    setAddingParentId(parentId);
    const maxOrder = Math.max(...menuItems.map(m => m.order_index), 0);
    setNewItemData({
      key: parentId ? `header.nav.submenu${maxOrder + 1}` : `header.nav.item${maxOrder + 1}`,
      url: "#",
      order_index: maxOrder + 1,
      text_ru: "",
      text_kz: "",
    });
  };

  const addMenuItem = async () => {
    if (!newItemData.text_ru || !newItemData.text_kz) {
      alert("Заполните тексты для обоих языков");
      return;
    }

    try {
      const { data: existingKey } = await supabase
        .from("translations")
        .select("key")
        .eq("key", newItemData.key)
        .maybeSingle();

      if (existingKey) {
        alert("Ключ уже существует. Измените его.");
        return;
      }

      const { error: transError } = await supabase
        .from("translations")
        .insert({
          key: newItemData.key,
          value_ru: newItemData.text_ru,
          value_kz: newItemData.text_kz,
        });

      if (transError) {
        console.error("Ошибка создания перевода:", transError);
        alert("Ошибка создания перевода: " + transError.message);
        return;
      }

      const { error: menuError } = await supabase
        .from("menu_items")
        .insert({
          key: newItemData.key,
          url: newItemData.url,
          order_index: newItemData.order_index,
          parent_id: addingParentId,
          is_active: true,
        });

      if (menuError) {
        console.error("Ошибка создания пункта:", menuError);
        alert("Ошибка создания пункта меню: " + menuError.message);
        return;
      }

      setIsAdding(false);
      setAddingParentId(null);
      loadMenuItems();
    } catch (err) {
      console.error("Непредвиденная ошибка:", err);
      alert("Произошла ошибка при добавлении");
    }
  };

  const mainItems = menuItems.filter(item => !item.parent_id);

  return (
    <div className="menu-manager">
      <div className="page-header">
        <h2>{t.menuManagement}</h2>
        <button className="btn-add" onClick={() => startAdding()}>
          {t.addMenuItem}
        </button>
      </div>

      {isAdding && !addingParentId && (
        <div className="menu-item-form">
          <div className="form-row-top">
            <input
              type="text"
              placeholder={t.menuKey}
              value={newItemData.key}
              onChange={(e) => setNewItemData({ ...newItemData, key: e.target.value })}
              className="form-input"
              style={{ flex: '1' }}
            />
            <input
              type="text"
              placeholder={t.url}
              value={newItemData.url}
              onChange={(e) => setNewItemData({ ...newItemData, url: e.target.value })}
              className="form-input"
              style={{ flex: '1' }}
            />
            <button onClick={addMenuItem} className="btn-save" style={{ flexShrink: 0 }}>{t.save}</button>
            <button onClick={() => setIsAdding(false)} className="btn-cancel" style={{ flexShrink: 0 }}>{t.cancel}</button>
          </div>
          <div className="form-row-bottom">
            <input
              type="text"
              placeholder={t.textRu}
              value={newItemData.text_ru}
              onChange={(e) => setNewItemData({ ...newItemData, text_ru: e.target.value })}
              className="form-input"
              style={{ flex: '1' }}
            />
            <input
              type="text"
              placeholder={t.textKz}
              value={newItemData.text_kz}
              onChange={(e) => setNewItemData({ ...newItemData, text_kz: e.target.value })}
              className="form-input"
              style={{ flex: '1' }}
            />
          </div>
        </div>
      )}

      <div className="menu-items-list">
        {mainItems.map((item) => {
          const subItems = menuItems.filter(sub => sub.parent_id === item.id);
          const isEditing = editingId === item.id;

          return (
            <div key={item.id} className="menu-item-card">
              {isEditing ? (
                <div className="menu-item-edit">
                  <div className="form-row-top">
                    <input
                      type="text"
                      placeholder={t.menuKey}
                      value={editData.key}
                      onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                    <input
                      type="text"
                      placeholder={t.url}
                      value={editData.url}
                      onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                    <button onClick={() => saveEdit(item.id)} className="btn-save" style={{ flexShrink: 0 }}>{t.save}</button>
                    <button onClick={() => setEditingId(null)} className="btn-cancel" style={{ flexShrink: 0 }}>{t.cancel}</button>
                  </div>
                  <div className="form-row-bottom">
                    <input
                      type="text"
                      placeholder={t.textRu}
                      value={editData.text_ru}
                      onChange={(e) => setEditData({ ...editData, text_ru: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                    <input
                      type="text"
                      placeholder={t.textKz}
                      value={editData.text_kz}
                      onChange={(e) => setEditData({ ...editData, text_kz: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="menu-item-view">
                  <div className="menu-item-info">
                    <span className="menu-key">{item.key}</span>
                    <span className="menu-url">{item.url}</span>
                    <span className="menu-order">#{item.order_index}</span>
                  </div>
                  <div className="menu-item-actions">
                    <button onClick={() => startAdding(item.id)} className="btn-add-sub">
                      {t.addSubItem}
                    </button>
                    <button onClick={() => startEdit(item)} className="btn-icon">{t.edit}</button>
                    <button onClick={() => deleteItem(item.id, item.key)} className="btn-icon delete">{t.delete}</button>
                  </div>
                </div>
              )}

              {subItems.length > 0 && (
                <div className="sub-items">
                  <h4>{t.subItems}</h4>
                  {subItems.map((subItem) => {
                    const isEditingSub = editingId === subItem.id;
                    return (
                      <div key={subItem.id} className="sub-item">
                        {isEditingSub ? (
                          <div className="menu-item-edit">
                            <div className="form-row-top">
                              <input
                                type="text"
                                placeholder={t.menuKey}
                                value={editData.key}
                                onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                                className="form-input"
                                style={{ flex: '1' }}
                              />
                              <input
                                type="text"
                                placeholder={t.url}
                                value={editData.url}
                                onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                                className="form-input"
                                style={{ flex: '1' }}
                              />
                              <button onClick={() => saveEdit(subItem.id)} className="btn-save" style={{ flexShrink: 0 }}>{t.save}</button>
                              <button onClick={() => setEditingId(null)} className="btn-cancel" style={{ flexShrink: 0 }}>{t.cancel}</button>
                            </div>
                            <div className="form-row-bottom">
                              <input
                                type="text"
                                placeholder={t.textRu}
                                value={editData.text_ru}
                                onChange={(e) => setEditData({ ...editData, text_ru: e.target.value })}
                                className="form-input"
                                style={{ flex: '1' }}
                              />
                              <input
                                type="text"
                                placeholder={t.textKz}
                                value={editData.text_kz}
                                onChange={(e) => setEditData({ ...editData, text_kz: e.target.value })}
                                className="form-input"
                                style={{ flex: '1' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="menu-item-view">
                            <div className="menu-item-info">
                              <span className="menu-key">{subItem.key}</span>
                              <span className="menu-url">{subItem.url}</span>
                            </div>
                            <div className="menu-item-actions">
                              <button onClick={() => startEdit(subItem)} className="btn-icon">{t.edit}</button>
                              <button onClick={() => deleteItem(subItem.id, subItem.key)} className="btn-icon delete">{t.delete}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {isAdding && addingParentId === item.id && (
                <div className="menu-item-form sub-form">
                  <div className="form-row-top">
                    <input
                      type="text"
                      placeholder={t.menuKey}
                      value={newItemData.key}
                      onChange={(e) => setNewItemData({ ...newItemData, key: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                    <input
                      type="text"
                      placeholder={t.url}
                      value={newItemData.url}
                      onChange={(e) => setNewItemData({ ...newItemData, url: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                    <button onClick={addMenuItem} className="btn-save" style={{ flexShrink: 0 }}>{t.save}</button>
                    <button onClick={() => { setIsAdding(false); setAddingParentId(null); }} className="btn-cancel" style={{ flexShrink: 0 }}>
                      {t.cancel}
                    </button>
                  </div>
                  <div className="form-row-bottom">
                    <input
                      type="text"
                      placeholder={t.textRu}
                      value={newItemData.text_ru}
                      onChange={(e) => setNewItemData({ ...newItemData, text_ru: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
                    <input
                      type="text"
                      placeholder={t.textKz}
                      value={newItemData.text_kz}
                      onChange={(e) => setNewItemData({ ...newItemData, text_kz: e.target.value })}
                      className="form-input"
                      style={{ flex: '1' }}
                    />
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