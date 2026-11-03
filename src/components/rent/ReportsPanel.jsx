import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { downloadCsv, lastMonths, monthKey, periodToDate } from '@/lib/rent';

export default function ReportsPanel({ payments = [], requests = [] }) {
  const { t, money, date } = useI18n();

  const rows = useMemo(() => lastMonths(6).map((month) => {
    const income = payments
      .filter((payment) => payment.status === 'succeeded' && monthKey(payment.created_date) === month)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const expense = requests
      .filter((request) => request.status === 'done' && monthKey(request.created_date) === month)
      .reduce((sum, request) => sum + Number(request.cost || 0), 0);
    return { month, income, expense, net: income - expense };
  }), [payments, requests]);

  const totals = rows.reduce(
    (acc, row) => ({ income: acc.income + row.income, expense: acc.expense + row.expense }),
    { income: 0, expense: 0 }
  );

  const exportCsv = () => {
    downloadCsv(`rent-report-${new Date().toISOString().slice(0, 10)}.csv`, [
      [t('common.period'), t('rent.income'), t('rent.expense'), t('rent.netIncome')],
      ...rows.map((row) => [row.month, Math.round(row.income), Math.round(row.expense), Math.round(row.net)]),
    ]);
  };

  const chartData = rows.map((row) => ({
    label: date(periodToDate(row.month), { month: 'short' }),
    income: Math.round(row.income),
    expense: Math.round(row.expense),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="label-xs">{t('rent.income')}</p>
          <p className="mt-1 font-heading text-lg font-semibold">{money(totals.income)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="label-xs">{t('rent.expense')}</p>
          <p className="mt-1 font-heading text-lg font-semibold">{money(totals.expense)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="label-xs">{t('rent.netIncome')}</p>
          <p className="mt-1 font-heading text-lg font-semibold">{money(totals.income - totals.expense)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="label-xs">{t('rent.monthsBack')}</p>
          <Button variant="outline" size="sm" className="rounded-full" onClick={exportCsv}>
            <Download className="mr-1 h-3.5 w-3.5" />{t('rent.exportCsv')}
          </Button>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={46} />
              <Tooltip
                formatter={(value) => money(value)}
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }}
              />
              <Bar dataKey="income" name={t('rent.income')} fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name={t('rent.expense')} fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}