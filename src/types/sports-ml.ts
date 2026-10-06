export type SportType = 'basketball' | 'soccer' | 'cricket' | 'baseball';

export type TaskType = 'regression' | 'classification';

export type MLAlgorithm = 
  | 'linear_regression'
  | 'ridge_regression'
  | 'random_forest_regressor'
  | 'logistic_regression'
  | 'random_forest_classifier'
  | 'knn';

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
}

export interface TargetDefinition {
  id: string;
  name: string;
  description: string;
  taskType: TaskType;
  unit: string;
  classes?: string[]; // for classification
}

export interface SportConfig {
  id: SportType;
  name: string;
  league: string;
  description: string;
  features: FeatureDefinition[];
  targets: TargetDefinition[];
}

export interface PlayerRecord {
  id: string;
  name: string;
  team: string;
  position: string;
  age: number;
  sport: SportType;
  features: Record<string, number>;
  targets: Record<string, number>;
}

export interface Hyperparameters {
  trainSplit: number; // e.g. 0.75
  regularizationAlpha: number; // For Ridge / Logistic
  maxDepth: number; // For Random Forest / Tree
  nEstimators: number; // For Random Forest
  kNeighbors: number; // For KNN
  learningRate: number; // For gradient updates
  iterations: number;
}

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  testSamples: number;
  trainSamples: number;
  residualStats: { min: number; max: number; mean: number; std: number };
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  testSamples: number;
  trainSamples: number;
}

export interface TrainedModelResult {
  algorithm: MLAlgorithm;
  sport: SportType;
  targetId: string;
  taskType: TaskType;
  featureIds: string[];
  hyperparameters: Hyperparameters;
  timestamp: string;
  metrics: {
    regression?: RegressionMetrics;
    classification?: ClassificationMetrics;
  };
  featureImportance: { featureId: string; featureName: string; weight: number }[];
  predictionsVsActual: { actual: number; predicted: number; playerName: string }[];
}

export interface DjangoFile {
  path: string;
  name: string;
  category: 'core' | 'models' | 'serializers' | 'views' | 'ml' | 'config' | 'deploy';
  language: 'python' | 'json' | 'yaml' | 'markdown' | 'dockerfile' | 'text';
  content: string;
  description: string;
}
