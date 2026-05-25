import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateFD, calculateSIP } from "@/lib/calculators";

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return `₹${INR_FORMATTER.format(value)}`;
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/70">{label}</span>
        <span className="font-semibold text-purple-300">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-purple-950/50 accent-purple-500"
      />
    </div>
  );
}

const Investments = () => {
  const [sipMonthlyAmount, setSipMonthlyAmount] = useState(5000);
  const [sipAnnualReturn, setSipAnnualReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  const [fdPrincipal, setFdPrincipal] = useState(100000);
  const [fdRate, setFdRate] = useState(7.5);
  const [fdYears, setFdYears] = useState(3);
  const [fdCompounding, setFdCompounding] = useState(4);

  const sipProjection = useMemo(
    () => calculateSIP(sipMonthlyAmount, sipAnnualReturn, sipYears),
    [sipMonthlyAmount, sipAnnualReturn, sipYears],
  );

  const sipChartData = useMemo(
    () =>
      sipProjection
        .filter((point) => point.month % 12 === 0 || point.month === 1)
        .map((point) => ({
          label: point.month === 1 ? "M1" : `Y${point.month / 12}`,
          invested: point.invested,
          returns: point.returns,
        })),
    [sipProjection],
  );

  const sipSummary = useMemo(() => {
    const finalPoint = sipProjection[sipProjection.length - 1];
    if (!finalPoint) {
      return { invested: 0, returns: 0, gain: 0 };
    }
    return {
      invested: finalPoint.invested,
      returns: finalPoint.returns,
      gain: finalPoint.gain,
    };
  }, [sipProjection]);

  const fdSummary = useMemo(
    () => calculateFD(fdPrincipal, fdRate, fdYears, fdCompounding),
    [fdPrincipal, fdRate, fdYears, fdCompounding],
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Investment Simulator</h1>
          <p className="text-foreground/70">
            Explore SIP and FD scenarios with live projections.
          </p>
        </div>

        <Tabs defaultValue="sip" className="space-y-6">
          <TabsList className="glass h-11 bg-purple-950/30 p-1">
            <TabsTrigger
              value="sip"
              className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-100"
            >
              SIP Calculator
            </TabsTrigger>
            <TabsTrigger
              value="fd"
              className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-100"
            >
              FD Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sip" className="mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="glass-card lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-purple-300">SIP Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SliderField
                    label="Monthly Investment"
                    value={sipMonthlyAmount}
                    min={500}
                    max={100000}
                    step={500}
                    onChange={setSipMonthlyAmount}
                  />
                  <SliderField
                    label="Expected Return"
                    value={sipAnnualReturn}
                    min={1}
                    max={30}
                    step={0.5}
                    suffix="%"
                    onChange={setSipAnnualReturn}
                  />
                  <SliderField
                    label="Investment Duration"
                    value={sipYears}
                    min={1}
                    max={40}
                    suffix=" yrs"
                    onChange={setSipYears}
                  />
                </CardContent>
              </Card>

              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    SIP Growth Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={sipChartData}>
                      <defs>
                        <linearGradient id="investedFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="returnsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="label"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.85)",
                          border: "1px solid rgba(139, 92, 246, 0.35)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        name="Amount Invested"
                        stroke="#a78bfa"
                        fill="url(#investedFill)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="returns"
                        name="Expected Returns"
                        stroke="#22d3ee"
                        fill="url(#returnsFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="glass rounded-xl border border-purple-500/30 p-4">
                      <p className="text-xs text-foreground/60">Amount Invested</p>
                      <p className="text-lg font-semibold text-purple-300">
                        {formatCurrency(sipSummary.invested)}
                      </p>
                    </div>
                    <div className="glass rounded-xl border border-cyan-500/30 p-4">
                      <p className="text-xs text-foreground/60">Expected Returns</p>
                      <p className="text-lg font-semibold text-cyan-300">
                        {formatCurrency(sipSummary.returns)}
                      </p>
                    </div>
                    <div className="glass rounded-xl border border-green-500/30 p-4">
                      <p className="text-xs text-foreground/60">Wealth Gain</p>
                      <p className="text-lg font-semibold text-green-300">
                        {formatCurrency(sipSummary.gain)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fd" className="mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="glass-card lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-purple-300">FD Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SliderField
                    label="Principal"
                    value={fdPrincipal}
                    min={10000}
                    max={1000000}
                    step={5000}
                    onChange={setFdPrincipal}
                  />
                  <SliderField
                    label="Interest Rate"
                    value={fdRate}
                    min={1}
                    max={12}
                    step={0.1}
                    suffix="%"
                    onChange={setFdRate}
                  />
                  <SliderField
                    label="Tenure"
                    value={fdYears}
                    min={1}
                    max={10}
                    suffix=" yrs"
                    onChange={setFdYears}
                  />
                  <SliderField
                    label="Compounding / Year"
                    value={fdCompounding}
                    min={1}
                    max={12}
                    onChange={setFdCompounding}
                  />
                </CardContent>
              </Card>

              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-purple-300">FD Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="glass rounded-2xl border border-purple-500/30 p-6">
                      <p className="text-sm text-foreground/70">Maturity Amount</p>
                      <p className="mt-2 text-3xl font-bold text-purple-300">
                        {formatCurrency(fdSummary.maturityAmount)}
                      </p>
                    </div>
                    <div className="glass rounded-2xl border border-green-500/30 p-6">
                      <p className="text-sm text-foreground/70">Total Interest</p>
                      <p className="mt-2 text-3xl font-bold text-green-300">
                        {formatCurrency(fdSummary.totalInterest)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-900/10 p-4 text-sm text-cyan-200">
                    Effective Yield: <span className="font-semibold">{fdSummary.effectiveYield}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Investments;
