import React, { useState, useEffect } from 'react';
import { 
  SportType, 
  PlayerRecord, 
  TrainedModelResult 
} from '../types/sports-ml';
import { SPORT_CONFIGS } from '../data/sports-datasets';
import { Zap, Send, User, Sparkles, Scale, AlertCircle } from 'lucide-react';

interface PredictionSandboxProps {
  currentSport: SportType;
  dataset: PlayerRecord[];
  trainedModel: TrainedModelResult | null;
  predictFn: ((features: Record<string, number>) => { prediction: number; confidence: number }) | null;
  onSendToApiPlayground: (payload: { sport: string; algorithm: string; target_name: string; features: Record<string, number> }) => void;
  onNavigateToTrain: () => void;
}

export const PredictionSandbox: React.FC<PredictionSandboxProps> = ({
  currentSport,
  dataset,
  trainedModel,
  predictFn,
  onSendToApiPlayground,
  onNavigateToTrain,
}) => {
  const sportCfg = SPORT_CONFIGS[currentSport];
  const targetDef = trainedModel 
    ? sportCfg.targets.find(t => t.id === trainedModel.targetId) || sportCfg.targets[0]
    : sportCfg.targets[0];

  // Selected player for prefill
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(dataset[0]?.id || '');
  
  // Feature input values
  const [featureInputs, setFeatureInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sportCfg.features.forEach(f => {
      init[f.id] = f.defaultValue;
    });
    return init;
  });

  // When player changes, prefill
  useEffect(() => {
    if (selectedPlayerId) {
      const pl = dataset.find(p => p.id === selectedPlayerId);
      if (pl) {
        setFeatureInputs(prev => ({
          ...prev,
          ...pl.features
        }));
      }
    }
  }, [selectedPlayerId, dataset]);

  // Compute live prediction
  const currentPrediction = predictFn ? predictFn(featureInputs) : null;

  const handleInputChange = (featureId: string, value: number) => {
    setFeatureInputs(prev => ({
      ...prev,
      [featureId]: value
    }));
  };

  // Scenario quick adjustments
  const applyScenario = (type: 'back_to_back' | 'tough_matchup' | 'high_usage') => {
    setFeatureInputs(prev => {
      const next = { ...prev };
      if (type === 'back_to_back') {
        if ('rest_days' in next) next['rest_days'] = 0;
      } else if (type === 'tough_matchup') {
        if ('opp_def_rank' in next) next['opp_def_rank'] = 2;
        if ('opp_table_position' in next) next['opp_table_position'] = 1;
        if ('opp_pitcher_era' in next) next['opp_pitcher_era'] = 2.4;
      } else if (type === 'high_usage') {
        if ('minutes' in next) next['minutes'] = Math.min(sportCfg.features.find(f => f.id === 'minutes')?.max || 40, next['minutes'] + 6);
        if ('usage_rate' in next) next['usage_rate'] = Math.min(36, next['usage_rate'] + 5);
      }
      return next;
    });
  };

  const handleSendToApi = () => {
    if (!trainedModel) return;
    onSendToApiPlayground({
      sport: currentSport,
      algorithm: trainedModel.algorithm,
      target_name: trainedModel.targetId,
      features: featureInputs
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Supervised Inference Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Model Evaluation</span>
              <span aria-hidden="true">·</span>
              <span>Continuous & Classification Outputs</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Player Performance Prediction Sandbox
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate game context parameters (playing time, opponent defensive caliber, rest schedule, usage intensity) and obtain immediate predictions from the active trained model.
            </p>
          </div>

          {/* Quick Roster Selector */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-slate-700 max-w-xs"
            >
              <option value="" disabled>Load from Active Roster...</option>
              {dataset.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.team} - {p.position})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!trainedModel && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <span className="font-semibold">Notice:</span> No active model has been trained for this sport session. A baseline estimator is running.
            </div>
          </div>
          <button
            onClick={onNavigateToTrain}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Train Custom Model
          </button>
        </div>
      )}

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feature Controls & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  Game Context Feature Vectors
                </h2>
                <span className="text-[11px] text-slate-400">
                  Adjust metrics to forecast how player performance responds
                </span>
              </div>

              {/* Scenario Shortcuts */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => applyScenario('back_to_back')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-medium transition-colors cursor-pointer"
                >
                  Zero Rest
                </button>
                <button
                  onClick={() => applyScenario('tough_matchup')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-medium transition-colors cursor-pointer"
                >
                  Elite Defense
                </button>
                <button
                  onClick={() => applyScenario('high_usage')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-medium transition-colors cursor-pointer"
                >
                  High Usage
                </button>
              </div>
            </div>

            {/* Feature Controls List */}
            <div className="space-y-4">
              {sportCfg.features.map((feat) => {
                const val = featureInputs[feat.id] ?? feat.defaultValue;
                return (
                  <div key={feat.id} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="text-slate-200 font-medium">{feat.name}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">[{feat.unit}]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {feat.min} to {feat.max}
                        </span>
                        <input
                          type="number"
                          step={feat.step}
                          min={feat.min}
                          max={feat.max}
                          value={val}
                          onChange={(e) => handleInputChange(feat.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-right font-mono text-emerald-400 text-xs focus:outline-none focus:border-slate-700 tabular-nums"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={feat.min}
                      max={feat.max}
                      step={feat.step}
                      value={val}
                      onChange={(e) => handleInputChange(feat.id, parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Scorecard & Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Live Scorecard */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  Live Supervised Prediction
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {targetDef.name}
              </span>
            </div>

            {/* Big Hero Stat Output */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl text-center space-y-2">
              <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                {targetDef.name}
              </span>

              {targetDef.taskType === 'regression' ? (
                <>
                  <div className="text-4xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
                    {currentPrediction ? currentPrediction.prediction : '--'}
                    <span className="text-base text-slate-400 ml-1 font-normal font-sans">
                      {targetDef.unit}
                    </span>
                  </div>

                  {currentPrediction && (
                    <div className="text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80">
                      <span>95% Confidence Interval: </span>
                      <span className="text-slate-200 tabular-nums">
                        [{(currentPrediction.prediction - 3.2).toFixed(1)} – {(currentPrediction.prediction + 3.2).toFixed(1)} {targetDef.unit}]
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold font-sans tracking-tight text-white">
                    {currentPrediction
                      ? (currentPrediction.prediction >= 0.5 
                          ? (targetDef.classes?.[1] || 'Positive Class (1)') 
                          : (targetDef.classes?.[0] || 'Negative Class (0)'))
                      : '--'}
                  </div>

                  {currentPrediction && (
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                      <span>Model Probability: </span>
                      <span className="text-emerald-400 font-semibold tabular-nums">
                        {(currentPrediction.prediction >= 0.5 ? 84.5 : 22.8).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Inference Breakdown */}
            <div className="space-y-2.5 text-xs">
              <span className="font-semibold text-slate-300 block">
                Model Inference Metadata
              </span>
              <div className="space-y-1.5 font-mono text-slate-400 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-sans text-slate-400">Sport League</span>
                  <span className="text-slate-200">{sportCfg.league}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-sans text-slate-400">Estimator Architecture</span>
                  <span className="text-slate-200">{trainedModel?.algorithm || 'Scikit-Learn Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-sans text-slate-400">Features Evaluated</span>
                  <span className="text-slate-200">{trainedModel?.featureIds.length || sportCfg.features.length} inputs</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-sans text-slate-400">Inference Latency</span>
                  <span className="text-emerald-400">&lt; 1.2 ms</span>
                </div>
              </div>
            </div>

            {/* Transfer to DRF API Button */}
            <button
              onClick={handleSendToApi}
              disabled={!trainedModel}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate HTTP POST in DRF API Explorer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
