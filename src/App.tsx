import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrainingStudio } from './components/TrainingStudio';
import { PredictionSandbox } from './components/PredictionSandbox';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ApiPlayground } from './components/ApiPlayground';
import { CodeExplorer } from './components/CodeExplorer';
import { SportType, PlayerRecord, TrainedModelResult } from './types/sports-ml';
import { INITIAL_DATASETS, SPORT_CONFIGS } from './data/sports-datasets';
import { trainSupervisedModel } from './ml/supervised-engine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('training');
  const [currentSport, setCurrentSport] = useState<SportType>('basketball');
  const [datasets, setDatasets] = useState<Record<SportType, PlayerRecord[]>>(INITIAL_DATASETS);
  
  // Trained model state
  const [trainedModel, setTrainedModel] = useState<TrainedModelResult | null>(null);
  const [predictFn, setPredictFn] = useState<((features: Record<string, number>) => { prediction: number; confidence: number }) | null>(null);

  // API playground bridge
  const [apiPayload, setApiPayload] = useState<{
    sport: string;
    algorithm: string;
    target_name: string;
    features: Record<string, number>;
  } | null>(null);

  // Auto-train initial model on load so the user lands on a fully populated, production-grade diagnostic view
  useEffect(() => {
    const defaultFeatures = SPORT_CONFIGS[currentSport].features.slice(0, 5).map(f => f.id);
    const { result, predictSingle } = trainSupervisedModel(
      datasets[currentSport],
      currentSport,
      SPORT_CONFIGS[currentSport].targets[0].id,
      'random_forest_regressor',
      defaultFeatures,
      {
        trainSplit: 0.75,
        regularizationAlpha: 0.1,
        maxDepth: 4,
        nEstimators: 15,
        kNeighbors: 3,
        learningRate: 0.05,
        iterations: 300,
      }
    );
    setTrainedModel(result);
    setPredictFn(() => predictSingle);
  }, [currentSport]);

  const handleModelTrained = (
    model: TrainedModelResult, 
    newPredictFn: (features: Record<string, number>) => { prediction: number; confidence: number }
  ) => {
    setTrainedModel(model);
    setPredictFn(() => newPredictFn);
  };

  const handleAddPlayer = (newPlayer: PlayerRecord) => {
    setDatasets(prev => ({
      ...prev,
      [currentSport]: [newPlayer, ...prev[currentSport]]
    }));
  };

  const handleSendToApiPlayground = (payload: {
    sport: string;
    algorithm: string;
    target_name: string;
    features: Record<string, number>;
  }) => {
    setApiPayload(payload);
    setActiveTab('api');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sportName={SPORT_CONFIGS[currentSport].name}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'training' && (
          <TrainingStudio
            currentSport={currentSport}
            setCurrentSport={setCurrentSport}
            dataset={datasets[currentSport]}
            onModelTrained={handleModelTrained}
            trainedModel={trainedModel}
            onNavigateToPrediction={() => setActiveTab('prediction')}
          />
        )}

        {activeTab === 'prediction' && (
          <PredictionSandbox
            currentSport={currentSport}
            dataset={datasets[currentSport]}
            trainedModel={trainedModel}
            predictFn={predictFn}
            onSendToApiPlayground={handleSendToApiPlayground}
            onNavigateToTrain={() => setActiveTab('training')}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            currentSport={currentSport}
            dataset={datasets[currentSport]}
            onAddPlayer={handleAddPlayer}
          />
        )}

        {activeTab === 'api' && (
          <ApiPlayground
            currentSport={currentSport}
            dataset={datasets[currentSport]}
            trainedModel={trainedModel}
            predictFn={predictFn}
            externalPayload={apiPayload}
          />
        )}

        {activeTab === 'code' && (
          <CodeExplorer />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SportPulse ML · Django REST Framework & Scikit-Learn Sports Analytics Architecture</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Django 5.0</span>
            <span aria-hidden="true">·</span>
            <span>DRF 3.15</span>
            <span aria-hidden="true">·</span>
            <span>Scikit-Learn 1.4</span>
            <span aria-hidden="true">·</span>
            <span>OpenAPI 3.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
