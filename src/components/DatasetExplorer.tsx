import React, { useState } from 'react';
import { SportType, PlayerRecord } from '../types/sports-ml';
import { SPORT_CONFIGS } from '../data/sports-datasets';
import { Search, Plus, Download, Filter, UserCheck, X } from 'lucide-react';

interface DatasetExplorerProps {
  currentSport: SportType;
  dataset: PlayerRecord[];
  onAddPlayer: (player: PlayerRecord) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  currentSport,
  dataset,
  onAddPlayer,
}) => {
  const sportCfg = SPORT_CONFIGS[currentSport];
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Player Form State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState(25);
  const [newPlayerFeatures, setNewPlayerFeatures] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sportCfg.features.forEach(f => {
      init[f.id] = f.defaultValue;
    });
    return init;
  });

  // Filtered list
  const filteredDataset = dataset.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = positionFilter === 'ALL' || player.position.includes(positionFilter);
    return matchesSearch && matchesPos;
  });

  // Unique positions
  const positions = ['ALL', ...Array.from(new Set(dataset.map(p => p.position.split('/')[0])))];

  const handleExportCsv = () => {
    const featureKeys = sportCfg.features.map(f => f.id);
    const targetKeys = sportCfg.targets.map(t => t.id);
    const headers = ['Name', 'Team', 'Position', 'Age', ...featureKeys, ...targetKeys].join(',');
    
    const rows = filteredDataset.map(p => {
      const fVals = featureKeys.map(k => p.features[k] ?? '');
      const tVals = targetKeys.map(k => p.targets[k] ?? '');
      return [`"${p.name}"`, `"${p.team}"`, `"${p.position}"`, p.age, ...fVals, ...tVals].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSport}_player_stats_dataset.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newRecord: PlayerRecord = {
      id: `pl-${currentSport}-${Date.now()}`,
      name: newPlayerName.trim(),
      team: newPlayerTeam.trim() || 'Free Agent',
      position: newPlayerPos.trim() || 'F',
      age: newPlayerAge,
      sport: currentSport,
      features: { ...newPlayerFeatures },
      targets: {
        points_predicted: 22.5,
        impact_rating: 14.0,
        match_rating: 7.4,
        projected_runs: 38,
        expected_ops: 0.810
      }
    };

    onAddPlayer(newRecord);
    setIsAddModalOpen(false);
    setNewPlayerName('');
    setNewPlayerTeam('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Historical Telemetry Database</span>
              <span aria-hidden="true">·</span>
              <span>Django ORM Model: MatchStat</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-400 tabular-nums">{dataset.length} active player records</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Player Performance Dataset & Feature Explorer
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect multi-dimensional telemetry collected across game fixtures. Used directly as training and test matrices for the Scikit-Learn supervised pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by player name or franchise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Position:</span>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-2.5 px-4 sticky left-0 bg-slate-950/90 z-10">Player & Team</th>
                <th className="py-2.5 px-3">Pos</th>
                <th className="py-2.5 px-3 text-right">Age</th>
                {sportCfg.features.map(f => (
                  <th key={f.id} className="py-2.5 px-3 text-right">
                    <span>{f.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1 font-mono">[{f.unit}]</span>
                  </th>
                ))}
                {sportCfg.targets.map(t => (
                  <th key={t.id} className="py-2.5 px-3 text-right bg-emerald-950/20 text-emerald-300 font-semibold">
                    <span>{t.name}</span>
                    <span className="text-[10px] text-emerald-500/80 ml-1 font-mono">[{t.unit}]</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredDataset.length > 0 ? (
                filteredDataset.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 sticky left-0 bg-slate-950/80 z-10 font-sans">
                      <div className="font-medium text-slate-200">{player.name}</div>
                      <div className="text-[11px] text-slate-500">{player.team}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{player.position}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">{player.age}</td>
                    {sportCfg.features.map(f => (
                      <td key={f.id} className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                        {player.features[f.id] !== undefined ? player.features[f.id] : '--'}
                      </td>
                    ))}
                    {sportCfg.targets.map(t => (
                      <td key={t.id} className="py-2.5 px-3 text-right font-bold text-emerald-400 bg-emerald-950/10 tabular-nums">
                        {player.targets[t.id] !== undefined ? player.targets[t.id] : '--'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4 + sportCfg.features.length + sportCfg.targets.length} className="text-center py-8 text-slate-500 font-sans">
                    No matching player records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Player Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Add New Player Stats Record</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPlayer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Player Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kyrie Irving"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Franchise / Team</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dallas Mavericks"
                    value={newPlayerTeam}
                    onChange={(e) => setNewPlayerTeam(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Position</label>
                  <input
                    type="text"
                    placeholder="e.g. PG"
                    value={newPlayerPos}
                    onChange={(e) => setNewPlayerPos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="45"
                    value={newPlayerAge}
                    onChange={(e) => setNewPlayerAge(parseInt(e.target.value) || 25)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="font-semibold text-slate-300 block">Sports Metrics Telemetry:</span>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {sportCfg.features.map(feat => (
                    <div key={feat.id}>
                      <label className="text-[11px] text-slate-400 block truncate">
                        {feat.name} ({feat.unit})
                      </label>
                      <input
                        type="number"
                        step={feat.step}
                        value={newPlayerFeatures[feat.id] ?? feat.defaultValue}
                        onChange={(e) => setNewPlayerFeatures({
                          ...newPlayerFeatures,
                          [feat.id]: parseFloat(e.target.value) || 0
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-400 text-slate-950 rounded font-semibold hover:bg-emerald-300 cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
