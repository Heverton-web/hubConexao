import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Material, AccessLog, Language, Role, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Eye, Users, TrendingUp, Trophy, BarChart2, Filter, X, Clock } from 'lucide-react';
import { SkeletonTable } from '../../components/SkeletonTable';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// --- Analytics Detail Modal ---
const AnalyticsDetailModal = ({ material, logs, onClose, lang }: { material: Material, logs: AccessLog[], onClose: () => void, lang: Language }) => {
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-6 bg-[#060709]/80 backdrop-blur-xl animate-reveal" style={{ zIndex: 9999 }}>
            <div className="aura-glass rounded-[2rem] border-white/[0.05] w-full max-w-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden relative">
                {/* Header Aura */}
                <div className="px-10 py-8 flex justify-between items-center border-b border-white/[0.03] bg-white/[0.01]">
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white heading-aura">Histórico de Acesso</h3>
                        <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mt-1 truncate">{material.title[lang] || material.title['pt-br']}</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] text-white/20 hover:text-white hover:bg-white/10 transition-all outline-none">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="p-24 text-center">
                            <Clock size={48} className="mx-auto mb-4 text-white/5" />
                            <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em]">Nenhum acesso registrado</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.03] bg-white/[0.01]">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Usuário</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Perfil</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Idioma</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {logs.map(log => (
                                    <tr key={log.id} className="group border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-6 font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wide text-[11px]">{log.userName}</td>
                                        <td className="px-10 py-6">
                                            <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[9px] font-black uppercase tracking-widest text-white/30">
                                                {log.userRole}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="px-3 py-1 rounded-lg bg-accent/5 border border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent">
                                                {log.language}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right text-white/20 font-black tabular-nums tracking-widest text-[10px]">
                                            {new Date(log.timestamp).toLocaleString(lang, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

interface AnalyticsTabProps {
    materials: Material[];
    accessLogs: AccessLog[];
    isLoading?: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ materials, accessLogs, isLoading = false }) => {
    const { t, language } = useLanguage();

    const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState<MaterialType | 'all'>('all');
    const [analyticsRoleFilter, setAnalyticsRoleFilter] = useState<Role | 'all'>('all');
    const [analyticsDetail, setAnalyticsDetail] = useState<{ material: Material, logs: AccessLog[] } | null>(null);

    const filteredLogs = useMemo(() => {
        return accessLogs.filter(log => {
            if (analyticsRoleFilter !== 'all' && log.userRole !== analyticsRoleFilter) return false;
            if (analyticsTypeFilter !== 'all') {
                const mat = materials.find(m => m.id === log.materialId);
                if (mat?.type !== analyticsTypeFilter) return false;
            }
            return true;
        });
    }, [accessLogs, analyticsRoleFilter, analyticsTypeFilter, materials]);

    const aggregatedMetrics = useMemo(() => {
        const map = new Map<string, { views: number, uniqueUsers: Set<string>, lastAccess: string | null }>();
        materials.forEach(m => {
            if (analyticsTypeFilter === 'all' || m.type === analyticsTypeFilter) {
                map.set(m.id, { views: 0, uniqueUsers: new Set(), lastAccess: null });
            }
        });
        filteredLogs.forEach(log => {
            const stats = map.get(log.materialId);
            if (stats) {
                stats.views++;
                stats.uniqueUsers.add(log.userId);
                if (!stats.lastAccess || new Date(log.timestamp) > new Date(stats.lastAccess)) {
                    stats.lastAccess = log.timestamp;
                }
            }
        });
        return Array.from(map.entries()).map(([id, stats]) => {
            const mat = materials.find(m => m.id === id);
            return { id, material: mat, views: stats.views, uniqueUsers: stats.uniqueUsers.size, lastAccess: stats.lastAccess };
        }).filter(item => item.material).sort((a, b) => b.views - a.views);
    }, [filteredLogs, materials, analyticsTypeFilter]);

    const activeUsersRanking = useMemo(() => {
        const userCounts: Record<string, { name: string, role: Role, count: number }> = {};
        filteredLogs.forEach(log => {
            if (!userCounts[log.userId]) {
                userCounts[log.userId] = { name: log.userName, role: log.userRole, count: 0 };
            }
            userCounts[log.userId].count++;
        });
        return Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 5);
        return Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [filteredLogs]);

    const chartData = useMemo(() => {
        // 1. Trend Data (Last 7 days)
        const days = 7;
        const trend = Array.from({ length: days }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return d.toISOString().split('T')[0];
        });

        const trendData = trend.map(date => {
            const count = filteredLogs.filter(l => l.timestamp.startsWith(date)).length;
            return { date: new Date(date).toLocaleDateString(language, { day: '2-digit', month: '2-digit' }), count };
        });

        // 2. Material Type Distribution
        const typeDist = [
            { name: t('material.type.pdf'), value: filteredLogs.filter(l => materials.find(m => m.id === l.materialId)?.type === 'pdf').length },
            { name: t('material.type.image'), value: filteredLogs.filter(l => materials.find(m => m.id === l.materialId)?.type === 'image').length },
            { name: t('material.type.video'), value: filteredLogs.filter(l => materials.find(m => m.id === l.materialId)?.type === 'video').length },
        ].filter(d => d.value > 0);

        return { trendData, typeDist };
    }, [filteredLogs, materials, language, t]);

    const openAnalyticsDetail = (materialId: string) => {
        const mat = materials.find(m => m.id === materialId);
        const logs = filteredLogs.filter(l => l.materialId === materialId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (mat) setAnalyticsDetail({ material: mat, logs });
    };

    return (
        <div className="animate-reveal space-y-10 pb-10">
            {/* Filter Bar Aura */}
            <div className="aura-glass p-6 rounded-3xl border-white/[0.03] flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex items-center gap-3 text-white/20 font-black uppercase text-[10px] tracking-[0.2em] lg:mr-auto">
                    <Filter size={16} className="text-accent" /> Filtros de Métricas
                </div>
                <div className="flex w-full lg:w-auto gap-4">
                    <select
                        className="flex-1 lg:w-44 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:border-accent/40 focus:bg-white/[0.04] transition-all appearance-none cursor-pointer"
                        value={analyticsTypeFilter}
                        onChange={e => setAnalyticsTypeFilter(e.target.value as any)}
                    >
                        <option value="all" className="bg-[#08090B]">{t('filter.all')}</option>
                        <option value="pdf" className="bg-[#08090B]">{t('material.type.pdf')}</option>
                        <option value="image" className="bg-[#08090B]">{t('material.type.image')}</option>
                        <option value="video" className="bg-[#08090B]">{t('material.type.video')}</option>
                    </select>
                    <select
                        className="flex-1 lg:w-44 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:border-accent/40 focus:bg-white/[0.04] transition-all appearance-none cursor-pointer"
                        value={analyticsRoleFilter}
                        onChange={e => setAnalyticsRoleFilter(e.target.value as any)}
                    >
                        <option value="all" className="bg-[#08090B]">{t('user.filter.all')}</option>
                        <option value="client" className="bg-[#08090B]">{t('role.client')}</option>
                        <option value="distributor" className="bg-[#08090B]">{t('role.distributor')}</option>
                        <option value="consultant" className="bg-[#08090B]">{t('role.consultant')}</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards Aura */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="aura-glass p-8 rounded-[2rem] border-white/[0.03] flex items-center gap-6 group hover:border-accent/20 transition-all duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(0,209,255,0.1)] group-hover:scale-110 transition-transform">
                        <Eye size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">{t('analytics.total.views')}</p>
                        <p className="text-3xl font-bold text-white heading-aura">{filteredLogs.length}</p>
                    </div>
                </div>
                <div className="aura-glass p-8 rounded-[2rem] border-white/[0.03] flex items-center gap-6 group hover:border-purple-500/20 transition-all duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">{t('analytics.unique.users')}</p>
                        <p className="text-3xl font-bold text-white heading-aura">{new Set(filteredLogs.map(l => l.userId)).size}</p>
                    </div>
                </div>
                <div className="aura-glass p-8 rounded-[2rem] border-white/[0.03] flex items-center gap-6 group hover:border-success/20 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-success/10 transition-all duration-700"></div>
                    <div className="w-16 h-16 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-center text-success shadow-[0_0_20px_rgba(0,255,157,0.1)] group-hover:scale-110 transition-transform shrink-0">
                        <TrendingUp size={28} />
                    </div>
                    <div className="relative z-10 min-w-0">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">{t('analytics.top.material')}</p>
                        <p className="text-lg font-bold text-white heading-aura truncate" title={aggregatedMetrics[0]?.material?.title[language] || 'N/A'}>
                            {aggregatedMetrics[0]?.material ? (aggregatedMetrics[0].material.title[language] || aggregatedMetrics[0].material.title['pt-br']) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section Aura */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 aura-glass p-8 rounded-[2.5rem] border-white/[0.03]">
                    <h3 className="text-xs font-black text-white/20 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
                        <TrendingUp size={16} className="text-accent animate-pulse" />
                        Tendência de Acesso (7 dias)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.trendData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#00D1FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0C0D11', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                    itemStyle={{ color: '#00D1FF', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'black' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#00D1FF" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="aura-glass p-8 rounded-[2.5rem] border-white/[0.03]">
                    <h3 className="text-xs font-black text-white/20 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
                        <BarChart2 size={16} className="text-purple-500" />
                        Distribuição por Tipo
                    </h3>
                    <div className="h-72 flex flex-col items-center">
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={chartData.typeDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.typeDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0C0D11', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex gap-4 mt-6">
                            {chartData.typeDist.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rankings Aura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top 5 Materials Aura */}
                <div className="aura-glass rounded-[2rem] border-white/[0.03] overflow-hidden">
                    <div className="px-8 py-6 bg-white/[0.02] border-b border-white/[0.03]">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Trophy size={16} className="text-yellow-500 shadow-yellow-500/20" />
                            {t('analytics.rank.materials')}
                        </h3>
                    </div>
                    <div className="p-8 space-y-6">
                        {aggregatedMetrics.slice(0, 5).map((item, index) => {
                            const mat = item.material;
                            if (!mat) return null;
                            const title = mat.title[language] || mat.title['pt-br'];
                            const percentage = Math.round((item.views / filteredLogs.length) * 100) || 0;
                            return (
                                <div key={item.id} className="group cursor-pointer">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black border transition-all
                                                ${index === 0 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
                                                    index === 1 ? 'bg-gray-400/10 text-gray-400 border-gray-400/20' :
                                                        index === 2 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                            'bg-white/[0.03] text-white/20 border-white/[0.05]'}`}>
                                                {index + 1}
                                            </div>
                                            <span className="text-[13px] font-bold text-white/60 group-hover:text-white truncate transition-colors uppercase tracking-wide">{title}</span>
                                        </div>
                                        <span className="text-[15px] font-black text-accent">{item.views}</span>
                                    </div>
                                    <div className="w-full bg-white/[0.02] rounded-full h-1 overflow-hidden">
                                        <div className="bg-accent h-full rounded-full shadow-[0_0_10px_rgba(0,209,255,0.5)] transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {aggregatedMetrics.length === 0 && <p className="text-[10px] font-black text-white/10 text-center py-8 uppercase tracking-widest">Sem dados disponíveis</p>}
                    </div>
                </div>

                {/* Top 5 Active Users Aura */}
                <div className="aura-glass rounded-[2rem] border-white/[0.03] overflow-hidden">
                    <div className="px-8 py-6 bg-white/[0.02] border-b border-white/[0.03]">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Users size={16} className="text-accent" />
                            {t('analytics.rank.users')}
                        </h3>
                    </div>
                    <div className="p-8 space-y-4">
                        {activeUsersRanking.map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.03] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent font-black text-sm group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,209,255,0.05)]">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">{user.name}</p>
                                        <p className="text-[9px] uppercase text-white/20 font-black tracking-widest mt-0.5">{t(`role.${user.role}`)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[15px] font-black text-white group-hover:text-accent transition-colors">{user.count}</p>
                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">acessos</p>
                                </div>
                            </div>
                        ))}
                        {activeUsersRanking.length === 0 && <p className="text-[10px] font-black text-white/10 text-center py-8 uppercase tracking-widest">Sem dados disponíveis</p>}
                    </div>
                </div>
            </div>

            {/* Metrics Table Aura */}
            <div className="aura-glass rounded-[2.5rem] border-white/[0.03] overflow-hidden">
                <div className="px-10 py-8 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Desempenho Geral</h3>
                </div>
                {isLoading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-white/5 uppercase font-black tracking-[0.5em] animate-pulse">
                        <BarChart2 size={48} className="mb-4 opacity-10" />
                        Consolidando Performance...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.03]">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('title')}</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('type')}</th>
                                    <th className="p-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('analytics.col.views')}</th>
                                    <th className="p-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('analytics.col.users')}</th>
                                    <th className="p-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('analytics.col.last_access')}</th>
                                    <th className="p-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {aggregatedMetrics.map(item => {
                                    const mat = item.material;
                                    if (!mat) return null;
                                    const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                                    return (
                                        <tr key={item.id} className="group border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                            <td className="p-8 font-bold text-white/60 group-hover:text-white max-w-sm truncate uppercase tracking-widest text-[12px] transition-colors" title={displayTitle}>{displayTitle}</td>
                                            <td className="p-8">
                                                <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-accent/60 transition-all">{mat.type}</span>
                                            </td>
                                            <td className="p-8 text-center font-black text-[15px] text-white/80 group-hover:text-accent transition-colors">{item.views}</td>
                                            <td className="p-8 text-center font-bold text-white/40">{item.uniqueUsers}</td>
                                            <td className="p-8 text-right text-white/20 font-black tabular-nums tracking-widest text-[10px]">
                                                {item.lastAccess ? new Date(item.lastAccess).toLocaleDateString(language, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="p-8 text-right">
                                                <button
                                                    onClick={() => openAnalyticsDetail(item.id)}
                                                    className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.05] text-white/20 hover:text-accent hover:border-accent/40 hover:bg-accent/10 transition-all outline-none"
                                                >
                                                    <BarChart2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Analytics Detail Modal Aura */}
            {analyticsDetail && analyticsDetail.material && (
                <AnalyticsDetailModal
                    material={analyticsDetail.material}
                    logs={analyticsDetail.logs}
                    onClose={() => setAnalyticsDetail(null)}
                    lang={language}
                />
            )}
        </div>
    );
};
