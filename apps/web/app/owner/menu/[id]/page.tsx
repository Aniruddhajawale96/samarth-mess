"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { menusApi } from "../../../../lib/api";
import { type MenuItemInput } from "../../../../lib/api/menus";
import { EmptyState, Card, CardHeader, CardContent, Button } from "../../../../components/ui";
import { MealTypeBadge, StatusBadge } from "../../../../components/domain";
import Link from "next/link";

export default function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const isNew = id === "new";
  const messIdParam = searchParams.get("messId");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<string>("DRAFT");
  const [items, setItems] = useState<MenuItemInput[]>([
    { mealType: "BREAKFAST", name: "", description: "", displayOrder: 1 },
    { mealType: "LUNCH", name: "", description: "", displayOrder: 2 },
    { mealType: "DINNER", name: "", description: "", displayOrder: 3 },
  ]);

  useEffect(() => {
    if (!isNew) {
      menusApi.getOwnerMenu(id)
        .then((res: any) => {
          setDate(res.menu.startDate);
          setStatus(res.menu.status);
          const formattedItems = res.items.map((item: any) => ({
            mealType: item.mealType,
            name: item.itemName,
            description: item.description || "",
            displayOrder: item.displayOrder,
          }));
          setItems(formattedItems.length ? formattedItems : items);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error(err);
          setError("Failed to load menu");
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleItemChange = (index: number, field: keyof MenuItemInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { mealType: "LUNCH", name: "", description: "", displayOrder: items.length + 1 }]);
  };
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async (publish: boolean) => {
    if (publish && !window.confirm("Publishing this menu will make it live and overwrite any currently published menu for this date. Continue?")) return;
    
    setSaving(true);
    setError("");

    try {
      const validItems = items.filter(i => i.name.trim() !== "");
      if (validItems.length === 0) throw new Error("At least one menu item is required.");

      let menuIdToPublish = id;

      if (isNew) {
        if (!messIdParam) throw new Error("Missing mess ID");
        const res = await menusApi.createOwnerMenu({
          messId: messIdParam,
          date,
          status: "DRAFT",
          items: validItems,
        });
        menuIdToPublish = res.menu.id;
      } else {
        await menusApi.updateOwnerMenu(id, { date, items: validItems });
      }

      if (publish) {
        await menusApi.publishOwnerMenu(menuIdToPublish);
      }
      
      router.push("/owner/menu");
    } catch (err: any) {
      setError(err.message || "Failed to save menu");
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading editor...</div>;
  
  const isArchived = status === "ARCHIVED";

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Link href="/owner/menu" className="hint" style={{ fontSize: 13 }}>← Menu History</Link>
          <h1 style={{ marginTop: 8 }}>{isNew ? "Create Menu" : "Edit Menu"}</h1>
        </div>
        {!isNew && <StatusBadge status={status} />}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <Card style={{ borderColor: status === "PUBLISHED" ? "var(--green)" : undefined }}>
        <CardHeader>
          <h2>Menu Details</h2>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 16 }}>
          <div>
            <label className="field-label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={isArchived}
            />
          </div>
        </CardContent>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Menu Items</h2>
        {!isArchived && <Button variant="secondary" onClick={addItem}>+ Add Item</Button>}
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Meal Type</label>
                  <select
                    className="input"
                    value={item.mealType}
                    onChange={e => handleItemChange(index, "mealType", e.target.value)}
                    disabled={isArchived}
                    style={{ width: "100%" }}
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label className="field-label">Item Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Paneer Butter Masala"
                    value={item.name}
                    onChange={e => handleItemChange(index, "name", e.target.value)}
                    disabled={isArchived}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              
              <div>
                <label className="field-label">Description (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Served with 3 rotis and rice"
                  value={item.description || ""}
                  onChange={e => handleItemChange(index, "description", e.target.value)}
                  disabled={isArchived}
                  style={{ width: "100%" }}
                />
              </div>

              {!isArchived && items.length > 1 && (
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={() => removeItem(index)}
                    style={{ color: "var(--red)", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                  >
                    Remove Item
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isArchived && (
        <div style={{ display: "flex", gap: 12, marginTop: 24, padding: 16, background: "var(--card)", borderRadius: 12, border: "1px solid var(--line)" }}>
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave(true)}
            disabled={saving}
            style={{ flex: 2 }}
          >
            {saving ? "Saving..." : "Publish Menu"}
          </Button>
        </div>
      )}
    </div>
  );
}
