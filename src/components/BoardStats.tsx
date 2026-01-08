import { useMemo, useState } from 'react'
import type { Task, BoardColumn } from '../types'
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Plus, Trash2, ChartBar, ChartPie, Settings2, Hash } from 'lucide-react'

interface ChartConfig {
    id: string
    title: string
    categoryColumnId: string
    valueColumnId: string
    type: 'bar' | 'pie'
}

interface BoardStatsProps {
    tasks: Task[]
    columns: BoardColumn[]
}

export function BoardStats({ tasks, columns }: BoardStatsProps) {
    const [charts, setCharts] = useState<ChartConfig[]>([
        {
            id: 'default',
            title: 'Distribuição por Status',
            categoryColumnId: columns.find(c => c.type === 'status')?.id || columns[1]?.id || '',
            valueColumnId: 'count',
            type: 'bar'
        }
    ])

    const addChart = () => {
        const newChart: ChartConfig = {
            id: crypto.randomUUID(),
            title: 'Análise de Dados',
            categoryColumnId: columns.find(c => c.type === 'status')?.id || columns[1]?.id || '',
            valueColumnId: 'count',
            type: 'bar'
        }
        setCharts([...charts, newChart])
    }

    const removeChart = (id: string) => setCharts(charts.filter(c => c.id !== id))
    const updateChart = (id: string, updates: Partial<ChartConfig>) => {
        setCharts(charts.map(c => c.id === id ? { ...c, ...updates } : c))
    }

    // Modern Premium Palette
    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

    return (
        <div className="p-10 space-y-12 pb-32 no-scrollbar">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-semibold text-white tracking-tight">Estatísticas</h2>
                    <p className="text-sm text-white/30 font-medium">Insights visuais baseados nas propriedades do seu projeto.</p>
                </div>
                <button
                    onClick={addChart}
                    className="bg-white text-black hover:bg-neutral-200 px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-luxury shadow-xl active:scale-95"
                >
                    <Plus size={16} />
                    <span>ADICIONAR INSIGHT</span>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {charts.map(chart => (
                    <ChartCard
                        key={chart.id}
                        chart={chart}
                        tasks={tasks}
                        columns={columns}
                        onUpdate={(u: any) => updateChart(chart.id, u)}
                        onRemove={() => removeChart(chart.id)}
                        colors={CHART_COLORS}
                    />
                ))}

                {charts.length === 0 && (
                    <div className="col-span-full py-32 border-2 border-dashed border-white/[0.05] rounded-[32px] flex flex-col items-center justify-center text-white/20 bg-white/[0.01]">
                        <Settings2 size={48} className="mb-4 opacity-10" />
                        <p className="font-medium tracking-tight">Nenhum insight configurado.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function ChartCard({ chart, tasks, columns, onUpdate, onRemove, colors }: any) {
    const data = useMemo(() => {
        const catCol = columns.find((c: any) => c.id === chart.categoryColumnId)
        if (!catCol) return []
        const valCol = columns.find((c: any) => c.id === chart.valueColumnId)
        const groups: Record<string, number> = {}
        let total = 0

        tasks.forEach((t: any) => {
            const catVal = t.data_json?.[catCol.id] || '(Sem valor)'
            let amount = 1
            if (valCol && valCol.type === 'number') {
                amount = parseFloat(t.data_json?.[valCol.id]) || 0
            }
            groups[catVal] = (groups[catVal] || 0) + amount
            total += amount
        })

        return Object.entries(groups).map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%'
        }))
    }, [tasks, columns, chart.categoryColumnId, chart.valueColumnId])

    const formatNumber = (value: any) => {
        const valCol = columns.find((c: any) => c.id === chart.valueColumnId)
        if (!valCol || valCol.type !== 'number') return value.toLocaleString('pt-BR')

        const format = valCol.options?.numberFormat
        switch (format) {
            case 'currency_brl':
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
            case 'currency_usd':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
            case 'decimal':
                return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
            default:
                return value.toLocaleString('pt-BR')
        }
    }

    return (
        <div className="bg-[#0f0f11] border border-white/[0.04] rounded-[28px] p-8 flex flex-col h-[500px] transition-luxury hover:bg-[#141416] hover:border-white/[0.1] group/chart">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 grow">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/20">
                        <Hash size={20} />
                    </div>
                    <input
                        className="bg-transparent border-none outline-none text-xl font-semibold text-white/90 w-full hover:bg-white/[0.03] rounded-lg px-2 -ml-2 transition-luxury"
                        value={chart.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-lg">
                    <button
                        onClick={() => onUpdate({ type: chart.type === 'bar' ? 'pie' : 'bar' })}
                        className={`p-2 rounded-md transition-luxury ${chart.type === 'pie' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5 text-white/20'}`}
                    >
                        {chart.type === 'bar' ? <ChartPie size={16} /> : <ChartBar size={16} />}
                    </button>
                    <button onClick={onRemove} className="p-2 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-luxury">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.03]">
                <div className="flex flex-col gap-1.5 grow">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Agrupar</label>
                    <select
                        className="bg-transparent border-none outline-none text-xs text-white/70 cursor-pointer font-medium"
                        value={chart.categoryColumnId}
                        onChange={(e) => onUpdate({ categoryColumnId: e.target.value })}
                    >
                        {columns.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0f0f11]">{c.name}</option>)}
                    </select>
                </div>
                <div className="w-[1px] h-8 bg-white/5" />
                <div className="flex flex-col gap-1.5 grow">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Valor</label>
                    <select
                        className="bg-transparent border-none outline-none text-xs text-white/70 cursor-pointer font-medium"
                        value={chart.valueColumnId}
                        onChange={(e) => onUpdate({ valueColumnId: e.target.value })}
                    >
                        <option value="count" className="bg-[#0f0f11]">Total de itens</option>
                        {columns.filter((c: any) => c.type === 'number').map((c: any) => (
                            <option key={c.id} value={c.id} className="bg-[#0f0f11]">Soma de {c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="glass-surface p-4 rounded-2xl shadow-luxury border border-white/[0.05]">
                                                <p className="text-xs font-semibold text-white mb-2">{payload[0].name}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
                                                    <p className="text-sm font-bold text-white">{formatNumber(payload[0].value)}</p>
                                                </div>
                                                <p className="text-[10px] text-white/30 mt-1 uppercase font-bold tracking-wider">{payload[0].payload.percentage} do total</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                {data.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="glass-surface p-4 rounded-2xl shadow-luxury border border-white/[0.05]">
                                                <p className="text-xs font-semibold text-white mb-2">{payload[0].name}</p>
                                                <p className="text-sm font-bold text-white">{formatNumber(payload[0].value)}</p>
                                                <p className="text-[10px] text-white/30 mt-1 uppercase font-bold tracking-wider">{payload[0].payload.percentage} do total</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                formatter={(value: any, entry: any) => (
                                    <span className="text-[11px] font-medium text-white/30 mr-4 transition-luxury hover:text-white/60">{value}</span>
                                )}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
