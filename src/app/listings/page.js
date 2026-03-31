"use client";

import DataImporter from "@/components/DataImporter";
import { Icon } from "@/components/icons";
import PropertyGrid from "@/components/PropertyListing/PropertyGrid";
import { useMemo, useState } from "react";

export default function ListingPage() {

  const defaultData = [
    {
      id: 1,
      title: "1 Bedroom Flat to Rent",
      location: "Mint Drive, Birmingham",
      price: "£950",
      beds: 1,
      bathroom: 1,
      type: "Flat",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    },
  ];

  const [properties, setProperties] = useState(defaultData);
  const [openModal, setOpenModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const [draftFilters, setDraftFilters] = useState({});
  const [filters, setFilters] = useState({});

  /* =========================================
     🔥 FLATTEN (ROBUST)
  ========================================= */

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

  /* =========================================
     🔥 UNIVERSAL PICK
  ========================================= */

  const pick = (obj, keys) => {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
        return obj[key];
      }
    }
    return null;
  };

  /* =========================================
     🔥 UNIVERSAL NORMALIZE
  ========================================= */

  const normalizeProperty = (item, index) => {
    const flat = flattenObject(item);

    const values = Object.values(flat);

    const title =
      pick(item, ["title", "name", "display_address", "property_name"]) ||
      values.find(v => typeof v === "string" && v.length > 10);

    const location =
      pick(item, ["location", "area", "address", "display_address"]) ||
      values.find(v => typeof v === "string" && v.length > 15);

    const beds =
      pick(item, ["beds", "bedroom", "bedrooms"]) ??
      values.find(v => String(v).match(/^\d$/) && v <= 10);

    const bathroom =
      pick(item, ["bathroom", "bath", "bathrooms"]) ??
      "-";

    const type =
      pick(item, ["type", "property_type", "category"]) ||
      "-";

    const image =
      pick(item, ["image", "thumbnail", "img"]) ||
      values.find(v => typeof v === "string" && v.includes("http")) ||
      "/no-image.jpg";

    const priceRaw =
      pick(item, ["price", "price_value", "amount", "rent", "price_pcm"]);

    let price = "N/A";
    if (priceRaw) {
      const numeric = String(priceRaw).replace(/[^0-9.]/g, "");
      if (numeric) price = `£${Number(numeric).toLocaleString()}`;
    }

    return {
      id: item.id || item._id || item.objectID || index,
      title: title || "Property",
      location: typeof location === "object" ? JSON.stringify(location) : location || "UK",
      price,
      beds: beds ?? "-",
      bathroom,
      type,
      image,
      raw: item,
    };
  };

  /* =========================================
     🔥 ARRAY EXTRACTOR (STRONG)
  ========================================= */

  const extractArray = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) return data;

    const queue = [data];

    while (queue.length) {
      const current = queue.shift();

      if (Array.isArray(current) && current.length) return current;

      if (typeof current === "object") {
        Object.values(current).forEach(v => queue.push(v));
      }
    }

    return [];
  };

  const handleApiResponse = (data) => {
    const list = extractArray(data);
    const normalized = list.map((item, i) => normalizeProperty(item, i));
    setProperties(normalized);
  };

  /* =========================================
     🔥 FILTER ENGINE (FIXED CLEAN)
  ========================================= */

 /* =========================================
   🔥 FILTER ENGINE (FINAL CLEAN)
========================================= */

/* =========================================
   🔥 FILTER ENGINE (FINAL CLEAN)
========================================= */

const dynamicAttributes = useMemo(() => {
  const map = {};

  const ignoreKeys = [
    "id",
    "image",
    "title",
    "price",
    "location",
    "raw",
    "address",
    "address1",
    "address2",
    "address3",
    "address4",
  ];

  const normalizeKey = (key) => {
    const k = key.toLowerCase();

    if (k.includes("bed")) return "beds";
    if (k.includes("bath")) return "bath";
    if (k.includes("type") || k.includes("property")) return "type";

    return key.split(".").pop();
  };

  const isValid = (val) => {
    if (val === null || val === undefined) return false;
    if (val === "") return false;
    if (val === "-") return false;
    if (val === "0") return false;
    if (val === 0) return false;

    if (typeof val === "boolean") return false;

    if (typeof val === "string") {
      if (val.length > 40) return false;
      if (val.includes("{") || val.includes("}")) return false;
      if (val.includes("http")) return false;
    }

    return true;
  };

  properties.forEach((item) => {
    const flat = flattenObject(item.raw || {});

    Object.entries(flat).forEach(([key, val]) => {
      if (!isValid(val)) return;

      const clean = normalizeKey(key);

      if (ignoreKeys.includes(clean)) return;

      if (!map[clean]) map[clean] = new Set();

      map[clean].add(val);
    });
  });

  const result = {};

  Object.entries(map).forEach(([k, set]) => {
    const values = [...set];

    /* ✅ remove single useless filters */
    if (values.length > 1 && values.length <= 8) {
      result[k] = values;
    }
  });

  return result;
}, [properties]);

  /* =========================================
     🔥 PRICE FILTER
  ========================================= */

  const getNumericPrice = (price) =>
    Number(String(price).replace(/[^0-9]/g, ""));

  const priceOptions = useMemo(() => {
    return [...new Set(properties.map((p) => getNumericPrice(p.price)))].sort(
      (a, b) => a - b
    );
  }, [properties]);

  /* =========================================
     🔥 APPLY FILTER
  ========================================= */

  const applyFilters = () => setFilters(draftFilters);

  const resetFilters = () => {
    setDraftFilters({});
    setFilters({});
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const flat = flattenObject(item.raw || {});
      const price = getNumericPrice(item.price);

      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;

        if (key === "minPrice") return price >= Number(val);
        if (key === "maxPrice") return price <= Number(val);

        return Object.values(flat).some(v => String(v) === String(val));
      });
    });
  }, [properties, filters]);

  /* =========================================
     🔥 UI (UNCHANGED)
  ========================================= */

  return (
    <div className="min-h-screen container-padding py-12 space-y-10">

      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl md:text-5xl font-secondary text-brand-dark">
          Explore Properties
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenModal(true)}
            className="px-6 py-3 bg-brand-dark text-white rounded-lg"
          >
            Import Data
          </button>

          <button
            onClick={() => setOpenFilter(true)}
            className="px-6 py-3 border rounded-lg"
          >
            Filters
          </button>
        </div>
      </div>
{openFilter && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setOpenFilter(false)}
    />

    <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={() => setOpenFilter(false)}>✕</button>
      </div>

      {/* BODY */}
      <div className="overflow-y-auto px-6 py-5">

        <div className="grid grid-cols-2 gap-6">

          {Object.keys(dynamicAttributes).map((attr) => {

            const iconMap = {
              beds: "bed",
              bath: "bath",
              type: "home",
              status: "status",
            };

            return (
              <div key={attr}>

                {/* TITLE + ICON */}
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                  <Icon name={iconMap[attr] || "tag"} size={16} />
                  <span className="capitalize">
                    {attr.replace(/_/g, " ")}
                  </span>
                </div>

                {/* OPTIONS */}
                <div className="flex flex-wrap gap-2">
                  {dynamicAttributes[attr].map((val) => (
                    <button
                      key={val}
                      onClick={() =>
                        setDraftFilters({
                          ...draftFilters,
                          [attr]: draftFilters[attr] === val ? "" : val,
                        })
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition
                      ${
                        draftFilters[attr] === val
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* FOOTER */}
      <div className="flex gap-3 p-4 border-t">
        <button
          onClick={() => {
            applyFilters();
            setOpenFilter(false);
          }}
          className="flex-1 bg-black text-white py-2.5 rounded-lg"
        >
          Apply
        </button>

        <button
          onClick={resetFilters}
          className="flex-1 border py-2.5 rounded-lg"
        >
          Reset
        </button>
      </div>

    </div>
  </div>
)}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenModal(false)} />
          <div className="relative bg-white p-6 rounded-xl w-[600px]">
            <DataImporter setProperties={handleApiResponse} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProperties.map((item) => (
          <PropertyGrid key={item.id} item={item} />
        ))}
      </div>

    </div>
  );
}