import { useMemo, useState } from 'react'
import type { Task, BoardColumn } from '../types'
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Plus, Trash2, ChartBar, ChartPie, Settings2 } from 'lucide-react'

interface ChartConfig {
    id: string
    title: string
    categoryColumnId: string // Eixo X ou Categorias da Pizza
    valueColumnId: string    // Eixo Y ou Tamanho da fatia (Contagem ou Soma)
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
            categoryColumnId: columns.find(c => c.type === 'status')?.id || columns[0]?.id || '',
            valueColumnId: 'count',
            type: 'bar'
        }
    ])

    const addChart = () => {
        const newChart: ChartConfig = {
            id: crypto.randomUUID(),
            title: 'Novo Gráfico',
            categoryColumnId: columns.find(c => c.type === 'status')?.id || columns[0]?.id || '',
            valueColumnId: 'count',
            type: 'bar'
        }
        setCharts([...charts, newChart])
    }

    const removeChart = (id: string) => {
        setCharts(charts.filter(c => c.id !== id))
    }

    const updateChart = (id: string, updates: Partial<ChartConfig>) => {
        setCharts(charts.map(c => c.id === id ? { ...c, ...updates } : c))
    }

    const NOTION_COLORS = ['#2383e2', '#529e72', '#df5452', '#cc7d24', '#9d68d3', '#d15796', '#5e87c9']

    return (
        <div className="p-12 space-y-12 pb-32">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Estatísticas do Projeto</h2>
                    <p className="text-sm text-[#8b8b8b]">Relacione colunas para gerar insights visuais.</p>
                </div>
                <button
                    onClick={addChart}
                    className="bg-[#2383e2] hover:bg-[#2a8ff5] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#2383e2]/20"
                >
                    <Plus size={18} />
                    <span>ADICIONAR GRÁFICO</span>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {charts.map(chart => (
                    <ChartCard
                        key={chart.id}
                        chart={chart}
                        tasks={tasks}
                        columns={columns}
                        onUpdate={(u: any) => updateChart(chart.id, u)}
                        onRemove={() => removeChart(chart.id)}
                        colors={NOTION_COLORS}
                    />
                ))}

                {charts.length === 0 && (
                    <div className="col-span-full py-20 border-2 border-dashed border-[#2f2f2f] rounded-2xl flex flex-col items-center justify-center text-[#8b8b8b]">
                        <Settings2 size={48} className="mb-4 opacity-20" />
                        <p>Nenhum gráfico configurado. Clique em adicionar para começar.</p>
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
        if (valCol?.options?.numberFormat === 'currency_brl') {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
        }
        if (valCol?.options?.numberFormat === 'currency_usd') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
        }
        return value.toLocaleString('pt-BR')
    }

    return (
        <div className="bg-[#202020] border border-[#2f2f2f] rounded-2xl p-6 hover:border-[#2383e2]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col h-[450px] group/chart">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                    <input
                        className="bg-transparent border-none outline-none text-lg font-bold text-white w-full hover:bg-[#2c2c2c] rounded px-2 -ml-2"
                        value={chart.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onUpdate({ type: chart.type === 'bar' ? 'pie' : 'bar' })}
                        className={`p-1.5 rounded transition-colors ${chart.type === 'pie' ? 'bg-[#2383e2] text-white' : 'hover:bg-[#2c2c2c] text-[#8b8b8b]'}`}
                    >
                        {chart.type === 'bar' ? <ChartPie size={16} /> : <ChartBar size={16} />}
                    </button>
                    <button onClick={onRemove} className="p-1.5 hover:bg-red-400/10 rounded text-[#8b8b8b] hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6 p-3 bg-[#191919] rounded-lg border border-[#2f2f2f]">
                <div className="flex flex-col gap-1 grow">
                    <label className="text-[9px] font-bold text-[#8b8b8b] uppercase px-1">Agrupar por</label>
                    <select
                        className="bg-transparent border-none outline-none text-[11px] text-white cursor-pointer px-1"
                        value={chart.categoryColumnId}
                        onChange={(e) => onUpdate({ categoryColumnId: e.target.value })}
                    >
                        {columns.map((c: any) => <option key={c.id} value={c.id} className="bg-[#191919]">{c.name}</option>)}
                    </select>
                </div>

                <div className="w-[1px] h-8 bg-[#2f2f2f]" />

                <div className="flex flex-col gap-1 grow">
                    <label className="text-[9px] font-bold text-[#8b8b8b] uppercase px-1">Valor de</label>
                    <select
                        className="bg-transparent border-none outline-none text-[11px] text-white cursor-pointer px-1"
                        value={chart.valueColumnId}
                        onChange={(e) => onUpdate({ valueColumnId: e.target.value })}
                    >
                        <option value="count" className="bg-[#191919]">Contagem total</option>
                        {columns.filter((c: any) => c.type === 'number').map((c: any) => (
                            <option key={c.id} value={c.id} className="bg-[#191919]">Soma de {c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full font-sans">
                <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
                            <XAxis dataKey="name" stroke="#8b8b8b" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8b8b8b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val > 1000 ? (val / 1000).toFixed(1) + 'k' : val} />
                            <Tooltip
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[#202020] border border-[#2f2f2f] p-3 rounded-lg shadow-xl">
                                                <p className="text-xs font-bold text-white mb-1">{payload[0].name}</p>
                                                <p className="text-[11px] text-[#2383e2] font-medium">Total: {formatNumber(payload[0].value)}</p>
                                                <p className="text-[11px] text-[#8b8b8b]">Representação: {payload[0].payload.percentage}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[#202020] border border-[#2f2f2f] p-3 rounded-xl shadow-2xl">
                                                <p className="text-xs font-bold text-white mb-1">{payload[0].name}</p>
                                                <p className="text-[11px] text-[#2383e2] font-medium">Total: {formatNumber(payload[0].value)}</p>
                                                <p className="text-[11px] text-[#8b8b8b]">Representação: {payload[0].payload.percentage}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value: any, entry: any) => (
                                    <span className="text-[10px] text-[#8b8b8b]">{value} ({entry.payload.percentage})</span>
                                )}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
