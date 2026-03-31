"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";

/* FLATTEN */
const flattenObject = (obj, prefix = "", res = {}) => {
  if (!obj) return res;

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          flattenObject(item, `${newKey}.${i}`, res);
        } else {
          res[`${newKey}.${i}`] = item;
        }
      });
    } else if (typeof value === "object" && value !== null) {
      flattenObject(value, newKey, res);
    } else {
      res[newKey] = value;
    }
  });

  return res;
};

/* UNIQUE ID */
const getId = (item) =>
  item?.crm_id ||
  item?.property_id ||
  item?.id ||
  item?.objectID ||
  item?.raw?.crm_id ||
  item?.raw?.id;

/* LOCATION FIX (handles JSON string/object) */
const parseLocation = (loc, flat) => {
  if (!loc) return "-";

  if (typeof loc === "string" && !loc.includes("{")) return loc;

  if (typeof loc === "string") {
    try {
      const parsed = JSON.parse(loc);
      return (
        parsed.inline ||
        parsed.display_address ||
        parsed.address ||
        parsed.address1 ||
        parsed.address2 ||
        parsed.address3 ||
        parsed.address4 ||
        "-"
      );
    } catch {
      return "-";
    }
  }

  if (typeof loc === "object") {
    return (
      loc.inline ||
      loc.display_address ||
      loc.address ||
      loc.address1 ||
      loc.address2 ||
      loc.address3 ||
      loc.address4 ||
      "-"
    );
  }

  return "-";
};

/* CLEAN (only remove obvious garbage; KEEP data) */
const isValid = (key, val) => {
  if (val === null || val === undefined || val === "") return false;
  if (!isNaN(Number(key))) return false; // remove 0,1,2 keys

  if (typeof val === "string") {
    if (val.includes("{") && val.includes("}")) return false; // JSON strings
    if (val.includes("http")) return false; // images/urls
  }

  return true;
};

export default function ComparePage() {
  const [items, setItems] = useState([]);

  /* LOAD */
  useEffect(() => {
    const compareIds = JSON.parse(localStorage.getItem("compareList") || "[]");
    const stored = JSON.parse(localStorage.getItem("propertiesData") || "{}");

    if (!stored?.data?.length) return;

    const filtered = stored.data.filter((item) =>
      compareIds.includes(getId(item))
    );

    setItems(filtered);
  }, []);

  /* REMOVE */
 const removeItem = (id) => {
  try {
    /* 🔥 GET EXISTING */
    const storedIds = JSON.parse(localStorage.getItem("compareList") || "[]");

    /* 🔥 REMOVE TARGET ID */
    const updated = storedIds.filter((i) => String(i) !== String(id));

    /* 🔥 SAVE BACK */
    localStorage.setItem("compareList", JSON.stringify(updated));

    /* 🔥 UPDATE UI */
    setItems((prev) =>
      prev.filter((item) => String(getId(item)) !== String(id))
    );

  } catch (err) {
    console.error("Remove error", err);
  }
};

  /* ALL DYNAMIC ATTRIBUTES (NO LIMIT) */
  const attributes = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      const flat = flattenObject(item.raw || {});

      Object.entries(flat).forEach(([key, val]) => {
        if (!isValid(key, val)) return;

        const k = key.split(".").pop();

        if (!map[k]) map[k] = new Set();
        map[k].add(val);
      });
    });

    return Object.keys(map); // 🔥 NO SLICE
  }, [items]);

  /* DIFFERENCE HIGHLIGHT */
  const isDifferent = (attr) => {
    const values = items.map((item) => {
      const flat = flattenObject(item.raw || {});
      return Object.entries(flat).find(([k]) =>
        k.endsWith(attr)
      )?.[1];
    });

    return new Set(values).size > 1;
  };

  if (!items.length) {
    return (
      <div className="container-padding py-20 text-center">
        <h2 className="text-2xl font-semibold">No properties selected</h2>
      </div>
    );
  }

 return (
  <div className="container-padding py-16 space-y-12">

    {/* HEADER */}
    <div className="space-y-2">
      <h1 className="text-4xl lg:text-5xl font-secondary text-brand-dark tracking-tight">
        Compare Properties
      </h1>
      <p className="text-brand-muted text-sm">
        Compare selected properties side by side
      </p>
    </div>

    {/* PROPERTY CARDS */}
    <div className="grid md:grid-cols-3 gap-8">

      {items.map((item) => (
        <div
          key={getId(item)}
          className="group bg-white rounded-2xl overflow-hidden 
          shadow-[0_10px_30px_rgba(0,0,0,0.05)] 
          hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
          transition-all duration-300"
        >

          <div className="relative overflow-hidden">
            <img
              src={item.image}
              className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="absolute bottom-3 left-3 
              bg-white/90 backdrop-blur px-3 py-1 rounded-md text-sm font-semibold shadow">
              {item.price}
            </div>
          </div>

          <div className="p-5 space-y-3">

            <h3 className="font-secondary text-lg text-brand-dark leading-tight">
              {item.title}
            </h3>

            <p className="text-sm text-brand-muted flex items-center gap-2">
              <Icon name="location" size={14} />
              {parseLocation(item.location, flattenObject(item.raw))}
            </p>

            <button
              onClick={() => removeItem(getId(item))}
              className="inline-flex items-center text-xs px-3 py-1.5 
              rounded-full bg-red-50 text-red-500 
              hover:bg-red-100 transition"
            >
              Remove
            </button>

          </div>

        </div>
      ))}

    </div>

    {/* TABLE */}
    <div className="overflow-x-auto rounded-2xl border border-brand-border">

      <table className="min-w-full text-sm">

        <tbody>

          {/* STATIC */}
          {["beds", "bathroom", "type"].map((field) => (
            <tr key={field} className="border-b border-brand-border/40">

              <td className="p-4 font-medium capitalize 
                bg-brand-light sticky left-0 z-10 text-brand-dark">
                {field}
              </td>

              {items.map((item) => (
                <td
                  key={getId(item)}
                  className="p-4 text-center font-medium text-brand-dark"
                >
                  {item[field] || "-"}
                </td>
              ))}

            </tr>
          ))}

          {/* DYNAMIC */}
          {attributes.map((attr) => (
            <tr
              key={attr}
              className={`border-b border-brand-border/40 
              transition ${
                isDifferent(attr)
                  ? "bg-brand-light/40"
                  : "hover:bg-brand-light/20"
              }`}
            >

              <td className="p-4 capitalize 
                bg-brand-light sticky left-0 z-10 text-brand-dark">
                {attr.replace(/_/g, " ")}
              </td>

              {items.map((item) => {
                const flat = flattenObject(item.raw || {});
                const val = Object.entries(flat).find(([k]) =>
                  k.endsWith(attr)
                )?.[1];

                return (
                  <td
                    key={getId(item)}
                    className={`p-4 text-center ${
                      isDifferent(attr)
                        ? "font-semibold text-brand-dark"
                        : "text-brand-muted"
                    }`}
                  >
                    {val ?? "-"}
                  </td>
                );
              })}

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>
);
}