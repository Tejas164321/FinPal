import {
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Area as RechartsArea,
  Cell as RechartsCell,
} from "recharts";

// Chart wrapper components with explicit props to avoid defaultProps warnings

interface XAxisProps {
  dataKey?: string;
  stroke?: string;
  fontSize?: number;
  tickLine?: boolean;
  axisLine?: boolean;
  tickFormatter?: (value: any) => string;
}

export const XAxis = ({
  dataKey,
  stroke = "#9CA3AF",
  fontSize = 12,
  tickLine = false,
  axisLine = false,
  tickFormatter,
  ...props
}: XAxisProps) => (
  <RechartsXAxis
    dataKey={dataKey}
    stroke={stroke}
    fontSize={fontSize}
    tickLine={tickLine}
    axisLine={axisLine}
    tickFormatter={tickFormatter}
    {...props}
  />
);

interface YAxisProps {
  stroke?: string;
  fontSize?: number;
  tickLine?: boolean;
  axisLine?: boolean;
  tickFormatter?: (value: any) => string;
}

export const YAxis = ({
  stroke = "#9CA3AF",
  fontSize = 12,
  tickLine = false,
  axisLine = false,
  tickFormatter,
  ...props
}: YAxisProps) => (
  <RechartsYAxis
    stroke={stroke}
    fontSize={fontSize}
    tickLine={tickLine}
    axisLine={axisLine}
    tickFormatter={tickFormatter}
    {...props}
  />
);

interface CartesianGridProps {
  strokeDasharray?: string;
  stroke?: string;
}

export const CartesianGrid = ({
  strokeDasharray = "3 3",
  stroke = "#374151",
  ...props
}: CartesianGridProps) => (
  <RechartsCartesianGrid
    strokeDasharray={strokeDasharray}
    stroke={stroke}
    {...props}
  />
);

interface TooltipProps {
  contentStyle?: React.CSSProperties;
  formatter?: (value: any, name?: string) => [string, string];
}

export const Tooltip = ({
  contentStyle = {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "8px",
    color: "#ffffff",
  },
  formatter,
  ...props
}: TooltipProps) => (
  <RechartsTooltip
    contentStyle={contentStyle}
    formatter={formatter}
    {...props}
  />
);

// Re-export other components as-is
export const ResponsiveContainer = RechartsResponsiveContainer;
export const AreaChart = RechartsAreaChart;
export const PieChart = RechartsPieChart;
export const Pie = RechartsPie;
export const Area = RechartsArea;
export const Cell = RechartsCell;
