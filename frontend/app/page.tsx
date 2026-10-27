"use client";

import React from "react";
import QueryProvider from "../components/providers/QueryProvider";
import { DashboardContainer } from "../containers/DashboardContainer";

export default function Home() {
  return (
    <QueryProvider>
      <DashboardContainer />
    </QueryProvider>
  );
}
