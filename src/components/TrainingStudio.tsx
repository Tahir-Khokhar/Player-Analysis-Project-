import React, { useState } from 'react';
import { 
  SportType, 
  MLAlgorithm, 
  TrainedModelResult, 
  Hyperparameters,
  TaskType,
  PlayerRecord
} from '../types/sports-ml';
import { SPORT_CONFIGS } from '../data/sports-datasets';
import { trainSupervisedModel } from '../ml/supervised-engine';
import { Play, RotateCcw, ArrowRight, Check, Sliders, BarChart3, Activity } from 'lucide-react';

interface TrainingStudioProps {
  currentSport: SportType;
  setCurrentSport: (sport: SportType) => void;
  dataset: PlayerRecord[];
  onModelTrained: (model: TrainedModelResult, predictFn: (features: Record<string, number>) => { prediction: number; confidence: number }) => void;
  trainedModel: TrainedModelResult | null;
  onNavigateToPrediction: () => void;
}

export const TrainingStudio: React.FC<TrainingStudioProps> = ({
  currentSport,
  setCurrentSport,
  dataset,
  onModelTrained,
  trainedModel,
  onNavigateToPrediction,
}) => {
  const sportCfg = SPORT_CONFIGS[currentSport];

  // Selection states
  const [selectedTargetId, setSelectedTargetId] = useState<string>(sportCfg.targets[0].id);
  const selectedTargetDef = sportCfg.targets.find(t => t.id === selectedTargetId) || sportCfg.targets[0];
  const taskType: TaskType = selectedTargetDef.taskType;

  // Algorithm state
  const [algorithm, setAlgorithm] = useState<MLAlgorithm>(
    taskType === 'regression' ? 'random_forest_regressor' : 'logistic_regression'
  );

  // Features selected
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    sportCfg.features.slice(0, 5).map(f => f.id)
  );

  // Hyperparameters
  const [hyperparams, setHyperparams] = useState<Hyperparameters>({
    trainSplit: 0.75,
    regularizationAlpha: 0.1,
    maxDepth: 4,
    nEstimators: 15,
    kNeighbors: 3,
    learningRate: 0.05,
    iterations: 300,
  });

  const [isTraining, setIsTraining] = useState(false);

  // Synchronize target change and valid algorithms
  const handleTargetChange = (targetId: string) => {
    setSelectedTargetId(targetId);
    const target = sportCfg.targets.find(t => t.id === targetId);
    if (target) {
      if (target.taskType === 'regression') {
        if (algorithm === 'logistic_regression' || algorithm === 'random_forest_classifier') {
          setAlgorithm('random_forest_regressor');
        }
      } else {
        if (algorithm === 'linear_regression' || algorithm === 'ridge_regression' || algorithm === 'random_forest_regressor') {
          setAlgorithm('logistic_regression');
        }
      }
    }
  };

  const handleSportChange = (sport: SportType) => {
    setCurrentSport(sport);
    const newCfg = SPORT_CONFIGS[sport];
    setSelectedTargetId(newCfg.targets[0].id);
    setSelectedFeatures(newCfg.features.slice(0, 5).map(f => f.id));
    setAlgorithm(newCfg.targets[0].taskType === 'regression' ? 'random_forest_regressor' : 'logistic_regression');
  };

  const toggleFeature = (featId: string) => {
    if (selectedFeatures.includes(featId)) {
      if (selectedFeatures.length <= 1) return; // keep at least 1
      setSelectedFeatures(selectedFeatures.filter(id => id !== featId));
    } else {
      setSelectedFeatures([...selectedFeatures, featId]);
    }
  };

  const handleTrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      try {
        const { result, predictSingle } = trainSupervisedModel(
          dataset,
          currentSport,
          selectedTargetId,
          algorithm,
          selectedFeatures,
          hyperparams
        );
        onModelTrained(result, predictSingle);
      } finally {
        setIsTraining(false);
      }
    }, 180);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Sport Selection */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Supervised Learning Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>Scikit-Learn Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Django REST Backend Ready</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Sports Player Performance Modeling
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Train linear, tree-based, or neighbor supervised models on granular player game metrics.
              Inspect evaluation metrics, feature importances, and deploy directly to DRF endpoints.
            </p>
          </div>

          {/* Sport Segmented Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
            {(['basketball', 'soccer', 'cricket', 'baseball'] as SportType[]).map((sport) => {
              const active = currentSport === sport;
              return (
                <button
                  key={sport}
                  onClick={() => handleSportChange(sport)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    active 
                      ? 'bg-slate-800 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {SPORT_CONFIGS[sport].name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Config on left, Diagnostics & Results on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model Setup & Hyperparams (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target & Task Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                1. Target Variable & Task Type
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {taskType === 'regression' ? 'Continuous (Regression)' : 'Binary (Classification)'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                Select Prediction Target
              </label>
              <div className="grid grid-cols-1 gap-2">
                {sportCfg.targets.map((tgt) => {
                  const isSelected = selectedTargetId === tgt.id;
                  return (
                    <button
                      key={tgt.id}
                      onClick={() => handleTargetChange(tgt.id)}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/80 border-emerald-500/60 shadow-xs'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">
                          {tgt.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {tgt.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {tgt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Algorithm Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-slate-300 block">
                Supervised Learning Algorithm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {taskType === 'regression' ? (
                  <>
                    <button
                      onClick={() => setAlgorithm('random_forest_regressor')}
                      className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'random_forest_regressor'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">Random Forest</div>
                      <div className="text-[10px] text-slate-400">Ensemble Decision Trees</div>
                    </button>
                    <button
                      onClick={() => setAlgorithm('linear_regression')}
                      className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'linear_regression'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">Linear (OLS)</div>
                      <div className="text-[10px] text-slate-400">Ordinary Least Squares</div>
                    </button>
                    <button
                      onClick={() => setAlgorithm('ridge_regression')}
                      className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'ridge_regression'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">Ridge Regressor</div>
                      <div className="text-[10px] text-slate-400">L2 Regularized Model</div>
                    </button>
                    <button
                      onClick={() => setAlgorithm('knn')}
                      className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'knn'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">K-Nearest Neighbors</div>
                      <div className="text-[10px] text-slate-400">Similarity Metric</div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setAlgorithm('logistic_regression')}
                      className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'logistic_regression'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">Logistic Regression</div>
                      <div className="text-[10px] text-slate-400">Sigmoid Probability</div>
                    </button>
                    <button
                      onClick={() => setAlgorithm('random_forest_classifier')}
                      className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'random_forest_classifier'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">Random Forest Clf</div>
                      <div className="text-[10px] text-slate-400">Ensemble Gini Split</div>
                    </button>
                    <button
                      onClick={() => setAlgorithm('knn')}
                      className={`col-span-2 p-2.5 text-left rounded-lg border text-xs cursor-pointer transition-colors ${
                        algorithm === 'knn'
                          ? 'bg-slate-800 border-emerald-500/60 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">KNN Classifier</div>
                      <div className="text-[10px] text-slate-400">K-Nearest Neighbors Voting</div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Feature Selection Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                2. Input Feature Selection
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {selectedFeatures.length} / {sportCfg.features.length} active
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {sportCfg.features.map((feat) => {
                const active = selectedFeatures.includes(feat.id);
                return (
                  <button
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition-colors cursor-pointer text-left ${
                      active
                        ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                        active ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="font-medium truncate">{feat.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      [{feat.unit}]
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hyperparameter Tuning Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>3. Hyperparameters</span>
              </h2>
              <button
                onClick={() => setHyperparams({
                  trainSplit: 0.75,
                  regularizationAlpha: 0.1,
                  maxDepth: 4,
                  nEstimators: 15,
                  kNeighbors: 3,
                  learningRate: 0.05,
                  iterations: 300,
                })}
                className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Train/Test Split */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Train/Test Split</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {Math.round(hyperparams.trainSplit * 100)}% Train / {Math.round((1 - hyperparams.trainSplit) * 100)}% Test
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.85"
                  step="0.05"
                  value={hyperparams.trainSplit}
                  onChange={(e) => setHyperparams({ ...hyperparams, trainSplit: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Algorithm-specific hyperparams */}
              {(algorithm === 'ridge_regression' || algorithm === 'logistic_regression') && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Regularization Alpha (L2)</span>
                    <span className="font-mono text-slate-200 tabular-nums">
                      {hyperparams.regularizationAlpha.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="1.5"
                    step="0.05"
                    value={hyperparams.regularizationAlpha}
                    onChange={(e) => setHyperparams({ ...hyperparams, regularizationAlpha: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              )}

              {(algorithm === 'random_forest_regressor' || algorithm === 'random_forest_classifier') && (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Number of Estimators (Trees)</span>
                      <span className="font-mono text-slate-200 tabular-nums">{hyperparams.nEstimators}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="35"
                      step="5"
                      value={hyperparams.nEstimators}
                      onChange={(e) => setHyperparams({ ...hyperparams, nEstimators: parseInt(e.target.value) })}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Tree Max Depth</span>
                      <span className="font-mono text-slate-200 tabular-nums">{hyperparams.maxDepth}</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="6"
                      step="1"
                      value={hyperparams.maxDepth}
                      onChange={(e) => setHyperparams({ ...hyperparams, maxDepth: parseInt(e.target.value) })}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {algorithm === 'knn' && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">K-Neighbors (k)</span>
                    <span className="font-mono text-slate-200 tabular-nums">{hyperparams.kNeighbors}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="2"
                    value={hyperparams.kNeighbors}
                    onChange={(e) => setHyperparams({ ...hyperparams, kNeighbors: parseInt(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Execute Train Button */}
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTraining ? 'Training Scikit Estimator...' : 'Train Supervised Model'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Model Diagnostics, Evaluation Metrics & Feature Importance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {trainedModel ? (
            <>
              {/* Performance Evaluation Card */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-wide">
                      Evaluation Diagnostics ({trainedModel.taskType.toUpperCase()})
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Trained via {trainedModel.algorithm.replace(/_/g, ' ')} on {trainedModel.featureIds.length} features
                    </p>
                  </div>
                  <button
                    onClick={onNavigateToPrediction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  >
                    <span>Test Predictions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantitative Metric Grid */}
                {trainedModel.taskType === 'regression' && trainedModel.metrics.regression && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <span className="text-[11px] text-slate-400 block">R² Score</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                        {trainedModel.metrics.regression.r2.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Variance explained</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <span className="text-[11px] text-slate-400 block">RMSE</span>
                      <span className="text-lg font-bold text-white font-mono tabular-nums">
                        {trainedModel.metrics.regression.rmse.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Root Mean Sq Err</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <span className="text-[11px] text-slate-400 block">MAE</span>
                      <span className="text-lg font-bold text-white font-mono tabular-nums">
                        {trainedModel.metrics.regression.mae.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Mean Absolute Err</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <span className="text-[11px] text-slate-400 block">Samples</span>
                      <span className="text-lg font-bold text-white font-mono tabular-nums">
                        {trainedModel.metrics.regression.testSamples}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Test split ({trainedModel.metrics.regression.trainSamples} train)
                      </span>
                    </div>
                  </div>
                )}

                {trainedModel.taskType === 'classification' && trainedModel.metrics.classification && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                        <span className="text-[11px] text-slate-400 block">Accuracy</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                          {(trainedModel.metrics.classification.accuracy * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Overall precision</span>
                      </div>

                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                        <span className="text-[11px] text-slate-400 block">F1-Score</span>
                        <span className="text-lg font-bold text-white font-mono tabular-nums">
                          {trainedModel.metrics.classification.f1.toFixed(3)}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Harmonic balance</span>
                      </div>

                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                        <span className="text-[11px] text-slate-400 block">Precision</span>
                        <span className="text-lg font-bold text-white font-mono tabular-nums">
                          {(trainedModel.metrics.classification.precision * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Positive predictive</span>
                      </div>

                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                        <span className="text-[11px] text-slate-400 block">Recall</span>
                        <span className="text-lg font-bold text-white font-mono tabular-nums">
                          {(trainedModel.metrics.classification.recall * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">True positive rate</span>
                      </div>
                    </div>

                    {/* Confusion Matrix Table */}
                    <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300 block mb-2">
                        2x2 Confusion Matrix (Test Partition)
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-slate-400 text-[10px] block">True Negative (TN)</span>
                          <span className="font-mono text-base font-bold text-slate-200 tabular-nums">
                            {trainedModel.metrics.classification.confusionMatrix[0][0]}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-slate-400 text-[10px] block">False Positive (FP)</span>
                          <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                            {trainedModel.metrics.classification.confusionMatrix[0][1]}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-slate-400 text-[10px] block">False Negative (FN)</span>
                          <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
                            {trainedModel.metrics.classification.confusionMatrix[1][0]}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-slate-400 text-[10px] block">True Positive (TP)</span>
                          <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                            {trainedModel.metrics.classification.confusionMatrix[1][1]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Importance Weights */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Feature Importance & Coefficients</span>
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Normalized weight budget = 1.00
                  </span>
                </div>

                <div className="space-y-2.5">
                  {trainedModel.featureImportance.map((item) => {
                    const pct = Math.round(item.weight * 100);
                    return (
                      <div key={item.featureId} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">{item.featureName}</span>
                          <span className="font-mono text-emerald-400 tabular-nums font-semibold">
                            {(item.weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Split Predictions vs Actual Table */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Test Split Actual vs. Predicted Output</span>
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
                    {trainedModel.predictionsVsActual.length} test records
                  </span>
                </div>

                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2 px-2">Player</th>
                        <th className="py-2 px-2 text-right">Actual Observed</th>
                        <th className="py-2 px-2 text-right">Model Prediction</th>
                        <th className="py-2 px-2 text-right">Residual Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {trainedModel.predictionsVsActual.map((item, idx) => {
                        const delta = +(item.predicted - item.actual).toFixed(2);
                        const isClose = Math.abs(delta) < 2.5;
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-1.5 px-2 font-sans text-slate-200 truncate max-w-[140px]">
                              {item.playerName}
                            </td>
                            <td className="py-1.5 px-2 text-right text-slate-300 tabular-nums">
                              {item.actual}
                            </td>
                            <td className="py-1.5 px-2 text-right text-emerald-400 font-semibold tabular-nums">
                              {item.predicted}
                            </td>
                            <td className={`py-1.5 px-2 text-right tabular-nums ${isClose ? 'text-slate-400' : 'text-amber-400'}`}>
                              {delta > 0 ? `+${delta}` : delta}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center p-8 bg-slate-900/30 border border-slate-800 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-semibold text-white">No Model Trained Yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select your target sports outcome, choose an algorithm (Linear, Ridge, Random Forest, Logistic, or KNN), adjust hyperparameters, and click "Train Supervised Model" to view live evaluation metrics and diagnostic curves.
                </p>
              </div>
              <button
                onClick={handleTrain}
                className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Train Model with Defaults
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
