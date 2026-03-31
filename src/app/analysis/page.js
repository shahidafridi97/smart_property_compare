"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* COLORS */
const COLORS = ["#0f172a", "#2563eb", "#10b981"];

/* FLATTEN */
const flattenObject = (obj, prefix = "", res = {}) => {
  if (!obj) return res;

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "object") {
          flattenObject(item, `${newKey}.${i}`, res);
        } else {
          res[`${newKey}.${i}`] = item;
        }
      });
    } else if (typeof value === "object") {
      flattenObject(value, newKey, res);
    } else {
      res[newKey] = value;
    }
  });

  return res;
};

/* ID */
const getId = (item) =>
  item?.crm_id ||
  item?.property_id ||
  item?.id ||
  item?.objectID ||
  item?.raw?.crm_id ||
  item?.raw?.id;

/* VALID */
const isValid = (key, val) => {
  if (!val) return false;
  if (!isNaN(Number(key))) return false;

  if (typeof val === "string") {
    if (val.includes("{")) return false;
    if (val.includes("http")) return false;
  }

  return true;
};

export default function AnalysisPage() {
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

  /* ATTRIBUTES */
  const attributes = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      const flat = flattenObject(item.raw || {});

      Object.entries(flat).forEach(([key, val]) => {
        if (!isValid(key, val)) return;

        const k = key.split(".").pop().toLowerCase();

        if (!map[k]) map[k] = [];
        map[k].push(val);
      });
    });

    return map;
  }, [items]);

  /* IMPORTANT KEYS */
  const importantKeys = Object.keys(attributes).filter((k) =>
    [
      "price",
      "plot",
      "area",
      "tax",
      "tenure",
      "beds",
      "bath",
    ].some((imp) => k.includes(imp))
  );

  /* PROPERTY LEGEND */
  const propertyLegend = items.map((item, i) => ({
    id: getId(item),
    title: item.title,
    image: item.image,
    color: COLORS[i % COLORS.length],
  }));

  if (!items.length) return <div>No data</div>;

  return (
    <div className="container-padding py-16 space-y-12">

      <h1 className="text-4xl font-secondary text-brand-dark">
        Smart Property Intelligence
      </h1>

      {/* 🔥 PROPERTY IDENTIFICATION */}
      <div className="flex gap-6 flex-wrap">

        {propertyLegend.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: p.color }}
            />

            <img
              src={p.image || "/no-image.jpg"}
              className="w-10 h-10 rounded-md object-cover"
            />

            <p className="text-sm font-medium max-w-[120px] truncate">
              {p.title}
            </p>
          </div>
        ))}

      </div>

      {/* 🔥 DYNAMIC GRAPHS */}
      {importantKeys.map((key) => {
        const vals = attributes[key];
        const numeric = vals.every((v) => !isNaN(Number(v)));

        const getInsight = () => {
          if (!numeric) return `Distribution varies across properties`;

          const nums = vals.map(Number);
          return `Lowest: ${Math.min(...nums)} | Highest: ${Math.max(...nums)}`;
        };

        const getAdvice = () => {
          if (key.includes("price"))
            return "Lower price may offer better entry value.";
          if (key.includes("plot") || key.includes("area"))
            return "Larger area improves long-term value.";
          if (key.includes("tax"))
            return "Higher tax band increases yearly costs.";
          if (key.includes("tenure"))
            return "Freehold is generally safer than leasehold.";
          if (key.includes("bed"))
            return "More bedrooms improve usability and resale.";
          return "Compare based on your requirement.";
        };

        /* 🔥 TEXT → PIE */
        if (!numeric) {
          const map = {};
          vals.forEach((v) => (map[v] = (map[v] || 0) + 1));

          const pieData = Object.entries(map).map(([k, v]) => ({
            name: k,
            value: v,
          }));

          return (
            <div key={key} className="bg-white p-6 rounded-2xl shadow space-y-4">

              <h2 className="text-lg font-semibold capitalize">
                {key.replace(/_/g, " ")}
              </h2>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={90}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="bg-brand-light p-4 rounded-xl text-sm">
                📊 {getInsight()} <br />
                💡 {getAdvice()}
              </div>

            </div>
          );
        }

        /* 🔥 NUMERIC → BAR */
        const data = items.map((item, i) => ({
          name: item.title.slice(0, 10),
          value: Number(vals[i]),
          fill: COLORS[i % COLORS.length],
        }));

        return (
          <div key={key} className="bg-white p-6 rounded-2xl shadow space-y-4">

            <h2 className="text-lg font-semibold capitalize">
              {key.replace(/_/g, " ")}
            </h2>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />

                <Bar dataKey="value">
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>

            <div className="bg-brand-light p-4 rounded-xl text-sm">
              📊 {getInsight()} <br />
              💡 {getAdvice()}
            </div>

          </div>
        );
      })}
    </div>
  );
}