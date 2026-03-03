"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface StatusChartProps {
  up: number;
  down: number;
}

const chartConfig: ChartConfig = {
  up: { label: "Up", color: "#34d399" },
  down: { label: "Down", color: "#f87171" },
};

function StatusChart({ up, down }: StatusChartProps) {
  const total = up + down;

  const data = [
    { name: "up", value: up, fill: chartConfig.up.color },
    { name: "down", value: down, fill: chartConfig.down.color },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={80}
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      URLs
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

/**
 * Memoized StatusChart component to prevent unnecessary re-renders.
 * Only re-renders when `up` or `down` props change.
 */
export default memo(StatusChart);
