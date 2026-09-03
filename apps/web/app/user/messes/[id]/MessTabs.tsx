"use client";

import { useState } from "react";
import { Tabs } from "../../../../components/ui";

export function MessTabs({ overview, menu, reviews }: { overview: React.ReactNode, menu: React.ReactNode, reviews: React.ReactNode }) {
  const [tab, setTab] = useState("overview");

  return (
    <div>
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { label: "Overview", value: "overview" },
          { label: "Today's Menu", value: "menu" },
          { label: "Reviews", value: "reviews" },
        ]}
      />
      
      {tab === "overview" && overview}
      {tab === "menu" && menu}
      {tab === "reviews" && reviews}
    </div>
  );
}
