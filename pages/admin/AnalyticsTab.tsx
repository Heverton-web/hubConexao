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
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="px-6 py-4 flex justify-between items-center bg-surface shadow-sm z-10">
                    <div>
                        <h3 className="font-bold text-lg text-main">Histórico de Acesso</h3>
                        <p className="text-xs text-muted max-w-md truncate">{material.title[lang] || material.title['pt-br']}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center text-muted">
                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                            Nenhum acesso registrado.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-page text-xs uppercase text-muted font-semibold sticky top-0">
                                <tr>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Perfil</th>
                                    <th className="p-4">Idioma</th>
                                    <th className="p-4 text-right">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-page transition-colors text-main">
                                        <td className="p-4 font-medium">{log.userName}</td>
                                        <td className="p-4">
                                            <span className="text-[10px] uppercase font-bold bg-page px-2 py-1 rounded text-muted">
                                                {log.userRole}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] uppercase font-bold bg-accent/10 text-accent px-2 py-1 rounded">
                                                {log.language}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-muted tabular-nums">
                                            {new Date(log.timestamp).toLocaleString(lang)}
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
        <div className="animate-fade-in space-y-6">
            {/* Filter Bar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-muted font-bold uppercase text-xs mr-auto">
                    <Filter size={16} /> Filtros de Métricas
                </div>
                <select
                    className="w-full md:w-auto p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main focus:ring-2 focus:ring-accent"
                    value={analyticsTypeFilter}
                    onChange={e => setAnalyticsTypeFilter(e.target.value as any)}
                >
                    <option value="all">{t('filter.all')}</option>
                    <option value="pdf">{t('material.type.pdf')}</option>
                    <option value="image">{t('material.type.image')}</option>
                    <option value="video">{t('material.type.video')}</option>
                </select>
                <select
                    className="w-full md:w-auto p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main focus:ring-2 focus:ring-accent"
                    value={analyticsRoleFilter}
                    onChange={e => setAnalyticsRoleFilter(e.target.value as any)}
                >
                    <option value="all">{t('user.filter.all')}</option>
                    <option value="client">{t('role.client')}</option>
                    <option value="distributor">{t('role.distributor')}</option>
                    <option value="consultant">{t('role.consultant')}</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Eye size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">{t('analytics.total.views')}</p>
                        <p className="text-2xl font-bold text-main">{filteredLogs.length}</p>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">{t('analytics.unique.users')}</p>
                        <p className="text-2xl font-bold text-main">{new Set(filteredLogs.map(l => l.userId)).size}</p>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">{t('analytics.top.material')}</p>
                        <p className="text-lg font-bold text-main truncate max-w-[200px]" title={aggregatedMetrics[0]?.material?.title[language] || 'N/A'}>
                            {aggregatedMetrics[0]?.material ? (aggregatedMetrics[0].material.title[language] || aggregatedMetrics[0].material.title['pt-br']) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-main mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-accent" />
                        Tendência de Acesso (7 dias)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.trendData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="date" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--color-text-main)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-main mb-4 flex items-center gap-2">
                        <BarChart2 size={18} className="text-purple-500" />
                        Distribuição por Tipo
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData.typeDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.typeDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--color-text-main)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top 5 Materials */}
                <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-page/30 flex justify-between items-center">
                        <h3 className="font-bold text-main flex items-center gap-2">
                            <Trophy size={18} className="text-yellow-500" />
                            {t('analytics.rank.materials')}
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {aggregatedMetrics.slice(0, 5).map((item, index) => {
                            const mat = item.material;
                            if (!mat) return null;
                            const title = mat.title[language] || mat.title['pt-br'];
                            const percentage = Math.round((item.views / filteredLogs.length) * 100) || 0;
                            return (
                                <div key={item.id} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-main truncate pr-2 flex items-center gap-2">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold 
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-page text-muted'}`}>
                                                {index + 1}
                                            </span>
                                            {title}
                                        </span>
                                        <span className="font-bold text-accent">{item.views}</span>
                                    </div>
                                    <div className="w-full bg-page rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-accent h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {aggregatedMetrics.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
                    </div>
                </div>

                {/* Top 5 Active Users */}
                <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-page/30 flex justify-between items-center">
                        <h3 className="font-bold text-main flex items-center gap-2">
                            <Users size={18} className="text-blue-500" />
                            {t('analytics.rank.users')}
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {activeUsersRanking.map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-page transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-main">{user.name}</p>
                                        <p className="text-[10px] uppercase text-muted font-bold">{t(`role.${user.role}`)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-main">{user.count}</p>
                                    <p className="text-[10px] text-muted">acessos</p>
                                </div>
                            </div>
                        ))}
                        {activeUsersRanking.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
                    </div>
                </div>
            </div>

            {/* Metrics Table */}
            <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4">
                    <h3 className="font-bold text-main">Desempenho Geral</h3>
                </div>
                {isLoading ? (
                    <SkeletonTable rows={5} columns={6} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-page text-xs uppercase text-muted font-semibold">
                                <tr>
                                    <th className="p-4">{t('title')}</th>
                                    <th className="p-4">{t('type')}</th>
                                    <th className="p-4 text-center">{t('analytics.col.views')}</th>
                                    <th className="p-4 text-center">{t('analytics.col.users')}</th>
                                    <th className="p-4 text-right">{t('analytics.col.last_access')}</th>
                                    <th className="p-4 text-right">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {aggregatedMetrics.map(item => {
                                    const mat = item.material;
                                    if (!mat) return null;
                                    const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                                    return (
                                        <tr key={item.id} className="hover:bg-page transition-colors text-main">
                                            <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                                            <td className="p-4 capitalize opacity-75">{mat.type}</td>
                                            <td className="p-4 text-center font-bold">{item.views}</td>
                                            <td className="p-4 text-center">{item.uniqueUsers}</td>
                                            <td className="p-4 text-right text-muted tabular-nums">
                                                {item.lastAccess ? new Date(item.lastAccess).toLocaleDateString(language) : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => openAnalyticsDetail(item.id)}
                                                    className="p-2 bg-page hover:bg-accent/10 text-muted hover:text-accent rounded-lg transition-colors"
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

            {/* Analytics Detail Modal */}
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
