"use client";

import { useEffect, useState, useMemo } from "react";
import { kmeans } from "ml-kmeans";

/* HELPERS */
const getId = (item) =>
  item?.crm_id || item?.id || item?.objectID || item?.raw?.id;

const getPrice = (price) =>
  Number(String(price || "").replace(/[^\d]/g, "")) || 0;

const flatten = (obj, res = {}) => {
  if (!obj) return res;
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === "object" && v !== null) flatten(v, res);
    else res[k] = v;
  });
  return res;
};

/* 🔥 UNIVERSAL NORMALIZER */
const normalizeData = (item) => {
  const merged = {
    ...item,
    ...(item.raw || {}),
    ...(item.attributes || {}),
    ...(item.details || {}),
  };

  const flat = flatten(merged);

  return {
    ...flat,

    price: item.price || flat.price,

    beds: flat.beds || flat.bedroom || item.beds || 0,
    bath: flat.bathroom || flat.bath || item.bathroom || 0,
    reception: flat.reception || item.reception || 0,

    council_tax:
      flat.council_tax ||
      flat.councilTax ||
      flat.council_tax_band ||
      flat.tax_band ||
      "-",

    area:
      flat.floor_area ||
      flat.plot_area ||
      flat.area ||
      flat.size ||
      "-",

    tenure:
      flat.tenure ||
      flat.property_tenure ||
      "-",

    epc:
      flat.epc ||
      flat.epc_rating ||
      flat.energy_rating ||
      "-",
  };
};

export default function ComparePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("compareList") || "[]");
    const stored = JSON.parse(localStorage.getItem("propertiesData") || "{}");

    if (!stored?.data?.length) return;
    setItems(stored.data.filter((i) => ids.includes(getId(i))));
  }, []);

  /* AI FEATURES */
  const features = useMemo(() => {
    return items.map((i) => {
      const d = normalizeData(i);
      return [
        getPrice(d.price),
        d.beds,
        d.bath,
        d.reception,
      ];
    });
  }, [items]);

  const clustered = useMemo(() => {
    if (!features.length) return [];

    try {
      const result = kmeans(features, Math.min(3, features.length));
      return items.map((i, idx) => ({
        ...i,
        cluster: result.clusters[idx],
      }));
    } catch {
      return items;
    }
  }, [features, items]);

  /* CLUSTER LOGIC */
  const clusterOrder = useMemo(() => {
    const map = {};

    clustered.forEach((i) => {
      const d = normalizeData(i);
      const p = getPrice(d.price);

      if (!map[i.cluster]) map[i.cluster] = [];
      map[i.cluster].push(p);
    });

    return Object.entries(map)
      .map(([k, arr]) => ({
        cluster: k,
        avg: arr.reduce((a, b) => a + b, 0) / arr.length,
      }))
      .sort((a, b) => a.avg - b.avg);
  }, [clustered]);

  const cheapest = [...clustered].sort((a, b) => {
    return (
      getPrice(normalizeData(a).price) -
      getPrice(normalizeData(b).price)
    );
  })[0];

  const bestCluster = clusterOrder[1]?.cluster;

  /* 🔥 ATTRIBUTES */
  const attributes = useMemo(() => {
    const priority = [
      "price",
      "beds",
      "bath",
      "reception",
      "council_tax",
      "area",
      "tenure",
      "epc",
    ];

    const dynamicSet = new Set();

    items.forEach((i) => {
      const data = normalizeData(i);
      Object.keys(data).forEach((k) => dynamicSet.add(k));
    });

    const dynamic = Array.from(dynamicSet).filter(
      (k) => !priority.includes(k)
    );

    return [...priority, ...dynamic.slice(0, 10)];
  }, [items]);

  if (!items.length) {
    return <div className="text-center py-20">No properties</div>;
  }

  const avgPrice =
    clustered.reduce(
      (a, b) => a + getPrice(normalizeData(b).price),
      0
    ) / clustered.length;

  return (
    <div className="container-padding py-16 space-y-20">

      {/* HEADER */}
 <div className="text-center space-y-5 max-w-3xl mx-auto">

  <h1 className="text-5xl md:text-6xl font-secondary text-brand-dark leading-tight">
    Compare Properties with Confidence
  </h1>

  <p className="text-base text-gray-600">
    Property prices, layouts and features can vary more than they appear.
  </p>

  <p className="text-base text-gray-600">
    This tool compares homes side by side and understands how they relate in the market.
  </p>

  <p className="text-base text-gray-600">
    It then highlights the one that offers the best overall value — not just the cheapest or the biggest.
  </p>

</div>

      {/* 🔥 AI INSIGHT BLOCK */}
  <div className="bg-gradient-to-b from-[#fffdf7] to-white 
  border border-[#f0e6c8] rounded-3xl p-8 md:p-10">

  <div className="grid md:grid-cols-3 gap-10 items-center">

    {/* LEFT — PRICE */}
    <div className="space-y-5">

      <h3 className="text-sm tracking-wide text-[#b8962e] uppercase font-medium">
        Price Insight
      </h3>

      <div>
        <p className="text-3xl font-secondary text-brand-dark">
          £{Math.round(avgPrice).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Average Market Price
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-brand-dark">
          {cheapest?.title}
        </p>
        <p className="text-xs text-gray-400">
          Lowest Priced Option
        </p>
      </div>

    </div>


    {/* 🔥 CENTER — MAIN RESULT */}
    <div className="text-center border-x border-[#f0e6c8] px-6">

      <p className="text-sm tracking-wide text-[#b8962e] uppercase font-medium mb-4">
        Top pick
      </p>

      <h2 className="text-2xl md:text-3xl font-secondary text-brand-dark leading-tight">
        {clustered.find(i => i.cluster == bestCluster)?.title}
      </h2>

      <div className="mt-5 inline-block px-6 py-2 
        bg-[#f5e6b2] text-[#7a5c00] text-sm font-semibold rounded-full">
        Best Value
      </div>

      <p className="mt-4 text-sm text-gray-500">
            Balanced price, space and usability
      </p>

    </div>


<div className="space-y-6 text-right">

  <h3 className="text-sm tracking-wide text-[#b8962e] uppercase font-medium">
    How AI Decides
  </h3>

  {/* STEP 1 */}
  <div>
    <p className="text-sm text-gray-600">
      Compares properties using price, size and key features
    </p>
  </div>

  {/* STEP 2 */}
  <div>
    <p className="text-sm text-gray-600">
      Groups similar homes to find the most balanced range
    </p>
  </div>

  {/* STEP 3 */}
  <div>
    <p className="text-sm font-medium text-brand-dark">
      Recommends the best value property from that group
    </p>
  </div>

</div>

  </div>

</div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-8">

        {clustered.map((item) => {
          const d = normalizeData(item);

          const isBest = item.cluster == bestCluster;
          const isCheap = getId(item) === getId(cheapest);

          return (
            <div
              key={getId(item)}
              className={`group relative rounded-3xl overflow-hidden transition-all duration-500
              ${
                isBest
                  ? "shadow-2xl scale-[1.03]"
                  : "shadow-md hover:shadow-xl"
              }`}
            >

              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {isBest && (
                  <div className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
                    Best Choice
                  </div>
                )}

                {isCheap && (
                  <div className="absolute top-4 right-4 bg-white text-black text-xs px-3 py-1 rounded-full">
                    Cheapest
                  </div>
                )}
              </div>

              <div className="p-5 bg-white">

                <h3 className="text-base font-semibold text-brand-dark line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {item.location}
                </p>

                <div className="mt-3 text-2xl font-bold text-brand-dark">
                  {d.price || "N/A"}
                </div>

                <div className="flex gap-4 text-xs text-gray-600 mt-3">
                  <span>{d.beds} Beds</span>
                  <span>{d.bath} Bath</span>
                  <span>{d.reception} Hall</span>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  AI Cluster #{item.cluster}
                </div>

                {/* 🔥 CARD INSIGHT */}
                <div className="mt-2 text-xs text-gray-600">
                  {isBest && "✔ Best balance of price and features"}
                  {isCheap && "✔ Most affordable option"}
                  {!isBest && !isCheap && "• Mid-range value property"}
                </div>

              </div>
            </div>
          );
        })}
      </div>

     <div className="space-y-12">

  {/* TITLE */}
  <h2 className="text-3xl font-secondary text-brand-dark text-center">
    Property Comparison
  </h2>

  <div className="max-w-7xl mx-auto px-4">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {items.map((item) => {
        const isBest = item.cluster == bestCluster;
        const data = normalizeData(item);

        return (
          <div
            key={getId(item)}
            className={`rounded-2xl border p-6 transition-all duration-300 h-full flex flex-col
            ${
              isBest
                ? "border-[#e8dcc0] bg-[#fffaf0] shadow-md"
                : "border-gray-200 bg-white"
            }`}
          >

            {/* HEADER */}
            <div className="mb-5 space-y-2">

              {/* FIXED TITLE */}
              <h3 className="text-lg font-secondary text-brand-dark leading-snug break-words line-clamp-2">
                {item.title}
              </h3>

              {/* OPTIONAL LOCATION (if exists) */}
              {item.location && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {item.location}
                </p>
              )}

              {isBest && (
                <div className="inline-block px-3 py-[3px] 
                  text-[10px] uppercase tracking-wide 
                  text-[#b8962e] border border-[#e8dcc0] rounded-full w-fit">
                  Best Value
                </div>
              )}

            </div>

            {/* KEY HIGHLIGHTS */}
            <div className="mb-6 grid grid-cols-2 gap-3 text-center">

              <div className="bg-[#faf7ed] rounded-lg py-2 px-2">
                <p className="text-[10px] text-gray-400 truncate">Price</p>
                <p className="text-sm font-semibold text-brand-dark break-words">
                  {data.price || "-"}
                </p>
              </div>

              <div className="bg-[#faf7ed] rounded-lg py-2 px-2">
                <p className="text-[10px] text-gray-400 truncate">Beds</p>
                <p className="text-sm font-semibold text-brand-dark">
                  {data.beds || "-"}
                </p>
              </div>

              <div className="bg-[#faf7ed] rounded-lg py-2 px-2">
                <p className="text-[10px] text-gray-400 truncate">Area</p>
                <p className="text-sm font-semibold text-brand-dark break-words">
                  {data.area || "-"}
                </p>
              </div>

              <div className="bg-[#faf7ed] rounded-lg py-2 px-2">
                <p className="text-[10px] text-gray-400 truncate">Tenure</p>
                <p className="text-sm font-semibold text-brand-dark break-words">
                  {data.tenure || "-"}
                </p>
              </div>

            </div>

            {/* DIVIDER */}
            <div className="border-t border-gray-100 mb-4" />

            {/* ATTRIBUTES */}
            <div className="space-y-3 flex-1">

              {attributes.map((attr) => (
                <div
                  key={attr}
                  className={`text-sm flex items-start justify-between gap-3
                  ${isBest ? "text-[#b8962e]" : "text-brand-dark"}`}
                >
                  {/* LABEL */}
                  <span className="text-sm text-gray-600 font-medium capitalize">
                    {attr.replace(/_/g, " ")}
                  </span>

                  {/* VALUE FIXED */}
                  <span className="font-semibold text-right break-words max-w-[55%]">
                    {data[attr] || "-"}
                  </span>
                </div>
              ))}

            </div>

          </div>
        );
      })}

    </div>

  </div>

</div>
<div className=" mx-auto px-4">

  <div className="rounded-3xl border border-[#e8dcc0] bg-gradient-to-b from-[#fffaf0] to-white p-10 md:p-12">

    {/* HEADER */}
    <div className="text-center space-y-3 mb-10">
      <h2 className="text-3xl font-secondary text-brand-dark">
        Smart Recommendation
      </h2>
      <p className="text-sm text-gray-500">
        Powered by  <span className="text-gray-700 font-bold font-secondary">PROPIQ</span> 
      </p>
    </div>

    {/* MAIN RESULT */}
    <div className="text-center mb-12">

      <p className="text-xs uppercase tracking-[2px] text-[#b8962e] mb-3">
        AI Selected
      </p>

      <h3 className="text-2xl md:text-3xl font-secondary text-brand-dark leading-tight max-w-xl mx-auto">
        {clustered.find(i => i.cluster == bestCluster)?.title}
      </h3>

      <div className="mt-5 inline-block px-6 py-2 
        bg-[#f5e6b2] text-[#7a5c00] text-sm font-semibold rounded-full">
        Best Overall Value
      </div>

    </div>

    {/* CONTENT GRID */}
    <div className="grid md:grid-cols-3 gap-8">

      {/* LEFT — BENEFITS */}
      <div className="space-y-4">

        <h4 className="text-sm uppercase tracking-wide text-[#b8962e] font-medium">
          Why this stands out
        </h4>

        <ul className="space-y-2 text-sm text-gray-600">
          <li>✔ Balanced price compared to similar homes</li>
          <li>✔ Better space utilisation</li>
          <li>✔ Strong overall livability</li>
          <li>✔ Avoids overpaying for premium listings</li>
        </ul>

      </div>

      {/* CENTER — VALUE MESSAGE */}
      <div className="flex flex-col justify-center items-center text-center px-4">

        <div className="text-4xl font-secondary text-[#b8962e] mb-3">
          Optimal
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          This property sits in the most balanced segment of the market — 
          giving you the best mix of cost, comfort and usability.
        </p>

      </div>

      {/* RIGHT — AI EXPLANATION */}
      <div className="space-y-4">

        <h4 className="text-sm uppercase tracking-wide text-[#b8962e] font-medium">
          How AI decides
        </h4>

        <div className="space-y-2 text-sm text-gray-600">

          <p>• Analyses price, bedrooms, bathrooms and space</p>

          <p>• Groups similar properties using clustering</p>

          <p>• Identifies natural market segments</p>

          <p className="font-medium text-brand-dark">
            • Selects the best value within the balanced group
          </p>

        </div>

      </div>

    </div>

  </div>

</div>

    </div>
  );
}