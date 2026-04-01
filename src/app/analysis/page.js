"use client";

import { useEffect, useState, useMemo } from "react";
import { kmeans } from "ml-kmeans";

/* =====================================================
   🔥 HELPERS
===================================================== */

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

const getId = (item) =>
  item?.crm_id ||
  item?.property_id ||
  item?.id ||
  item?.objectID ||
  item?.raw?.crm_id ||
  item?.raw?.id;

const toNumber = (val) => {
  const n = Number(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (val) =>
  val ? `£${Number(val).toLocaleString()}` : "N/A";

/* =====================================================
   🔥 MAIN COMPONENT
===================================================== */

export default function AnalysisPage() {
  const [items, setItems] = useState([]);
  const [priority, setPriority] = useState("balanced");
const [openIndex, setOpenIndex] = useState(null);

const toggle = (i) => {
  setOpenIndex(openIndex === i ? null : i);
};

const sections = [
  {
    title: "Data Normalization",
    content: `
Before analysis, all property data is standardized into a consistent format.

Different sources may provide data in various structures (API, JSON, nested objects). 
The system extracts and converts key attributes into comparable numeric values:

• Price → converted to pure number (removes £, commas, etc.)
• Area → normalized into square feet
• Bedrooms → ensured as numeric value

This step is critical because machine learning models like K-Means require structured numerical inputs. 
Without normalization, comparisons would be inaccurate or impossible.
`,
  },
  {
    title: "K-Means Clustering",
    content: `
The system uses K-Means clustering to automatically group similar properties.

Each property is represented as:
[Price, Area, Bedrooms]

The algorithm then:
1. Randomly initializes 3 cluster centers
2. Assigns each property to the nearest cluster
3. Recalculates cluster centers
4. Repeats until stable

This results in 3 natural groups:

• Budget → Lower price, smaller properties
• Balanced → Moderate price and size
• Premium → Higher price, larger or luxury properties

Important:
These clusters are NOT predefined — they are learned dynamically from the data.
`,
  },
  {
    title: "Value Calculation",
    content: `
To determine real investment value, the system calculates:

Price per Square Foot = Price / Area

This metric reveals the true cost efficiency of a property.

Example:
• Property A → £1000 / 500 sqft = £2/sqft
• Property B → £1500 / 1000 sqft = £1.5/sqft

Even though Property B is more expensive, it provides better value.

Lower price per sqft = better investment efficiency.
`,
  },
  {
    title: "AI Scoring Model",
    content: `
Each property is assigned a composite score using multiple weighted factors:

Score = 
  (Bedrooms × weight) 
+ (Area contribution) 
+ (Value efficiency bonus) 
- (Price penalty)

Factors considered:

• Bedrooms → usability and family suitability
• Area → space advantage
• Price → affordability (penalty applied)
• Price per sqft → value efficiency (reward)

This ensures the system does NOT simply choose the cheapest property,
but instead selects the most balanced and valuable option.
`,
  },
  {
    title: "Dynamic Ranking",
    content: `
The ranking system adapts based on user preference.

Instead of fixed ranking, users can choose:

• Balanced → overall best (AI score based)
• Budget → lowest price prioritized
• Space → largest area prioritized
• Value → best price per sqft prioritized

This makes the system flexible for different decision goals.

Example:
A buyer may prioritize space, while an investor may prioritize value.
`,
  },
  {
    title: "Final Insights",
    content: `
After processing, the system generates actionable insights:

• Best Overall Property → highest AI score
• Cheapest Option → lowest price
• Largest Property → maximum area
• Best Value → lowest price per sqft

Additionally:
• Cluster category (Budget / Balanced / Premium)
• Confidence score
• Risk indicators (high price, low space, etc.)

These insights help users make faster and more informed decisions 
without manually comparing multiple attributes.
`,
  },
];
  useEffect(() => {
    const compareIds = JSON.parse(localStorage.getItem("compareList") || "[]");
    const stored = JSON.parse(localStorage.getItem("propertiesData") || "{}");

    if (!stored?.data?.length) return;

    const filtered = stored.data.filter((item) =>
      compareIds.includes(getId(item))
    );

    setItems(filtered);
  }, []);

  /* =====================================================
     🔥 NORMALIZATION
  ===================================================== */

  const normalized = useMemo(() => {
    return items.map((item) => {
      const flat = flattenObject(item.raw || {});

      const price = toNumber(item.price);
      const beds = Number(item.beds) || 0;
      const area = toNumber(flat["area"] || item.area);

      const pricePerSqft = area ? price / area : 0;

      const baseScore =
        beds * 2 +
        area / 100 -
        price / 1000;

      const advancedScore =
        beds * 3 +
        area / 80 +
        (1 / (pricePerSqft || 1)) * 500 -
        price / 2000;

      return {
        ...item,
        price,
        beds,
        area,
        pricePerSqft,
        baseScore,
        advancedScore,
      };
    });
  }, [items]);

  /* =====================================================
     🔥 K-MEANS CLUSTERING
  ===================================================== */

  const kmeansData = useMemo(() => {
    return normalized.map((p) => [
      p.price,
      p.area,
      p.beds,
    ]);
  }, [normalized]);

  const clusterResult = useMemo(() => {
    if (kmeansData.length < 2) return null;

    try {
      return kmeans(kmeansData, 3);
    } catch {
      return null;
    }
  }, [kmeansData]);

  const clusteredItems = useMemo(() => {
    if (!clusterResult) return normalized;

    return normalized.map((p, i) => ({
      ...p,
      cluster: clusterResult.clusters[i],
    }));
  }, [normalized, clusterResult]);

  /* =====================================================
     🔥 CLUSTER ANALYSIS
  ===================================================== */

  const clusterLabels = useMemo(() => {
    const labels = {};

    if (!clusterResult) return labels;

    const map = {};

    clusteredItems.forEach((p) => {
      if (!map[p.cluster]) map[p.cluster] = [];
      map[p.cluster].push(p);
    });

    Object.entries(map).forEach(([cluster, props]) => {
      const avgPrice =
        props.reduce((sum, p) => sum + p.price, 0) / props.length;

      if (avgPrice < 1500) labels[cluster] = "💰 Budget";
      else if (avgPrice < 3500) labels[cluster] = "⚖️ Balanced";
      else labels[cluster] = "🏆 Premium";
    });

    return labels;
  }, [clusteredItems, clusterResult]);

  /* =====================================================
     🔥 PRIORITY SORTING
  ===================================================== */

  const finalRanking = useMemo(() => {
    let arr = [...clusteredItems];

    if (priority === "budget") return arr.sort((a, b) => a.price - b.price);
    if (priority === "space") return arr.sort((a, b) => b.area - a.area);
    if (priority === "value")
      return arr.sort((a, b) => a.pricePerSqft - b.pricePerSqft);

    return arr.sort((a, b) => b.advancedScore - a.advancedScore);
  }, [clusteredItems, priority]);

  /* =====================================================
     🔥 KEY INSIGHTS
  ===================================================== */

  const best = finalRanking[0];
  const cheapest = [...clusteredItems].sort((a, b) => a.price - b.price)[0];
  const largest = [...clusteredItems].sort((a, b) => b.area - a.area)[0];
  const bestValue = [...clusteredItems].sort(
    (a, b) => a.pricePerSqft - b.pricePerSqft
  )[0];

  /* =====================================================
     🔥 DOMINANCE
  ===================================================== */

  const dominance = useMemo(() => {
    return clusteredItems.map((p) => {
      let wins = 0;

      clusteredItems.forEach((o) => {
        if (p === o) return;

        if (p.price < o.price) wins++;
        if (p.area > o.area) wins++;
        if (p.pricePerSqft < o.pricePerSqft) wins++;
      });

      return { ...p, wins };
    });
  }, [clusteredItems]);

  /* =====================================================
     🔥 AI INSIGHTS
  ===================================================== */

  const generateInsight = (p) => {
    const insights = [];

    if (p === cheapest) insights.push("Most affordable option");
    if (p === largest) insights.push("Largest available property");
    if (p === bestValue) insights.push("Best value per sqft");

    if (p.beds >= 3) insights.push("Ideal for families");

    if (p.cluster !== undefined)
      insights.push(`Cluster: ${clusterLabels[p.cluster]}`);

    return insights;
  };

  const riskAnalysis = (p) => {
    const risks = [];

    if (p.price > best.price) risks.push("Higher price vs best option");
    if (p.area < 500) risks.push("Limited space");

    return risks;
  };

  const confidence = (p) => {
    let score = 0;

    if (p === best) score += 40;
    if (p === bestValue) score += 30;
    if (p === largest) score += 20;

    return Math.min(score, 100);
  };

  if (!items.length)
    return <div className="p-10">No comparison data found</div>;

  /* =====================================================
     🔥 UI
  ===================================================== */

  return (
    <div className="container-padding py-16 space-y-14">
<div className="space-y-4">

  <h1 className="text-4xl font-secondary text-brand-dark">
    AI Property Intelligence Engine
  </h1>

  <p className="text-gray-500 text-sm max-w-2xl">
    This system analyses properties using clustering and scoring algorithms 
    to identify the best decision based on value, space, and cost.
  </p>

</div>

      {/* PRIORITY */}
      <div className="flex gap-3 flex-wrap">
        {["balanced", "budget", "space", "value"].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`px-5 py-2 rounded-full text-sm ${
              priority === p
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* TOP INSIGHTS */}
      <div className="grid md:grid-cols-4 gap-6">
        <HighlightCard title="Best" item={best} />
        <HighlightCard title="Cheapest" item={cheapest} />
        <HighlightCard title="Largest" item={largest} />
        <HighlightCard title="Best Value" item={bestValue} />
      </div>

      {/* RANKING */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Ranking</h2>

        {finalRanking.map((p, i) => (
          <div key={p.id} className="flex justify-between py-2 border-b">
            <span>{i + 1}. {p.title}</span>
            <span>{clusterLabels[p.cluster]}</span>
          </div>
        ))}
      </div>

      {/* DOMINANCE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Dominance</h2>

        {dominance.map((p) => (
          <div key={p.id} className="flex justify-between text-sm">
            <span>{p.title}</span>
            <span>{p.wins} wins</span>
          </div>
        ))}
      </div>

      {/* PROPERTY CARDS */}
      <div className="grid md:grid-cols-3 gap-6">

        {clusteredItems.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-xl shadow space-y-3">

            <h3 className="font-semibold">{p.title}</h3>

            <p className="text-sm text-gray-500">
              {formatCurrency(p.price)} • {p.area} sqft
            </p>

            {/* INSIGHTS */}
            <div className="text-green-600 text-sm space-y-1">
              {generateInsight(p).map((txt, i) => (
                <p key={i}>✔ {txt}</p>
              ))}
            </div>

            {/* RISKS */}
            <div className="text-red-500 text-sm space-y-1">
              {riskAnalysis(p).map((r, i) => (
                <p key={i}>⚠ {r}</p>
              ))}
            </div>

            {/* CONFIDENCE */}
            <p className="text-xs text-gray-400">
              Confidence: {confidence(p)}%
            </p>

          </div>
        ))}

      </div>


{/* 🔥 ACCORDION */}
<div className="bg-white border border-gray-200 rounded-2xl divide-y">

  {sections.map((sec, i) => (
    <div key={i}>

      {/* HEADER */}
      <button
        onClick={() => toggle(i)}
        className="w-full flex justify-between items-center px-6 py-4 text-left"
      >
        <span className="font-medium text-brand-dark">
          {sec.title}
        </span>

        <span className="text-xl">
          {openIndex === i ? "-" : "+"}
        </span>
      </button>

      {/* CONTENT */}
    {openIndex === i && (
  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed space-y-2">
    {sec.content.split("\n").map((line, idx) => {
      const text = line.trim();

      if (!text) return null;

      // 🔥 Bullet points
      if (text.startsWith("•")) {
        return (
          <div key={idx} className="flex gap-2">
            <span>•</span>
            <span>{text.replace("•", "").trim()}</span>
          </div>
        );
      }

      // 🔥 Section headings
      if (/^\d+\./.test(text)) {
        return (
          <p key={idx} className="font-medium text-brand-dark mt-2">
            {text}
          </p>
        );
      }

      // 🔥 Default paragraph
      return <p key={idx}>{text}</p>;
    })}
  </div>
)}

    </div>
  ))}

</div>

      {/* FINAL DECISION */}
      <div className="bg-black text-white p-8 rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Final Recommendation</h2>

        <p>
          Based on clustering and scoring →{" "}
          <b>{best.title}</b> is the best property.
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   🔥 COMPONENTS
===================================================== */

function HighlightCard({ title, item }) {
  if (!item) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow space-y-2">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="font-semibold">{item.title}</p>
      <p className="text-sm text-gray-500">£{item.price}</p>
    </div>
  );
}