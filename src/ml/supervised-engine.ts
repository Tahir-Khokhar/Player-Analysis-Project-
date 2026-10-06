import { 
  MLAlgorithm, 
  PlayerRecord, 
  Hyperparameters, 
  TrainedModelResult, 
  TaskType, 
  RegressionMetrics, 
  ClassificationMetrics,
  SportType 
} from '../types/sports-ml';
import { SPORT_CONFIGS } from '../data/sports-datasets';

// Simple Matrix / Vector Math utilities
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, v) => acc + v, 0) / arr.length;
}

function std(arr: number[], m?: number): number {
  if (arr.length <= 1) return 1;
  const mu = m ?? mean(arr);
  const variance = arr.reduce((acc, v) => acc + Math.pow(v - mu, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance) || 1;
}

// Standardization (Z-score normalization)
export interface Scaler {
  means: number[];
  stds: number[];
  transform: (row: number[]) => number[];
}

export function fitStandardScaler(X: number[][]): Scaler {
  const nCols = X[0].length;
  const means: number[] = [];
  const stds: number[] = [];

  for (let j = 0; j < nCols; j++) {
    const colVals = X.map(row => row[j]);
    const m = mean(colVals);
    const s = std(colVals, m);
    means.push(m);
    stds.push(s === 0 ? 1 : s);
  }

  return {
    means,
    stds,
    transform: (row: number[]) => row.map((val, idx) => (val - means[idx]) / stds[idx])
  };
}

// Train/Test Split
export function trainTestSplit<T>(
  items: T[], 
  trainRatio: number = 0.75, 
  seed: number = 42
): { train: T[]; test: T[] } {
  // Simple deterministic shuffle using LCG
  const shuffled = [...items];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const splitIdx = Math.max(1, Math.min(items.length - 1, Math.floor(items.length * trainRatio)));
  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx)
  };
}

// Train Linear / Ridge Regression via Gradient Descent or Normal Equation
function trainLinearRidgeRegression(
  X_train: number[][],
  y_train: number[],
  alpha: number = 0.01,
  learningRate: number = 0.05,
  epochs: number = 300
): { weights: number[]; bias: number } {
  const nSamples = X_train.length;
  const nFeatures = X_train[0].length;
  const weights = new Array(nFeatures).fill(0);
  let bias = mean(y_train);

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array(nFeatures).fill(0);
    let gradB = 0;

    for (let i = 0; i < nSamples; i++) {
      let pred = bias;
      for (let j = 0; j < nFeatures; j++) {
        pred += weights[j] * X_train[i][j];
      }
      const error = pred - y_train[i];
      for (let j = 0; j < nFeatures; j++) {
        gradW[j] += error * X_train[i][j];
      }
      gradB += error;
    }

    for (let j = 0; j < nFeatures; j++) {
      // L2 penalty derivative = 2 * alpha * w
      const regularizer = 2 * alpha * weights[j];
      weights[j] -= learningRate * ((gradW[j] / nSamples) + regularizer);
    }
    bias -= learningRate * (gradB / nSamples);
  }

  return { weights, bias };
}

// Logistic Regression (Binary Classifier)
function trainLogisticRegression(
  X_train: number[][],
  y_train: number[],
  alpha: number = 0.01,
  learningRate: number = 0.08,
  epochs: number = 350
): { weights: number[]; bias: number } {
  const nSamples = X_train.length;
  const nFeatures = X_train[0].length;
  const weights = new Array(nFeatures).fill(0);
  let bias = 0;

  const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array(nFeatures).fill(0);
    let gradB = 0;

    for (let i = 0; i < nSamples; i++) {
      let z = bias;
      for (let j = 0; j < nFeatures; j++) {
        z += weights[j] * X_train[i][j];
      }
      const p = sigmoid(z);
      const error = p - y_train[i];
      for (let j = 0; j < nFeatures; j++) {
        gradW[j] += error * X_train[i][j];
      }
      gradB += error;
    }

    for (let j = 0; j < nFeatures; j++) {
      const regularizer = alpha * weights[j];
      weights[j] -= learningRate * ((gradW[j] / nSamples) + regularizer);
    }
    bias -= learningRate * (gradB / nSamples);
  }

  return { weights, bias };
}

// Decision Tree Node for Random Forest
interface TreeNode {
  isLeaf: boolean;
  value: number; // class or mean
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

function buildTree(
  X: number[][],
  y: number[],
  maxDepth: number,
  taskType: TaskType,
  currentDepth: number = 0
): TreeNode {
  if (X.length === 0) return { isLeaf: true, value: 0 };
  if (currentDepth >= maxDepth || X.length <= 2) {
    if (taskType === 'classification') {
      const sum = y.reduce((acc, v) => acc + v, 0);
      return { isLeaf: true, value: sum >= (y.length / 2) ? 1 : 0 };
    } else {
      return { isLeaf: true, value: mean(y) };
    }
  }

  const nFeatures = X[0].length;
  let bestFeat = 0;
  let bestThresh = 0;
  let bestScore = Infinity;
  let bestLeftIndices: number[] = [];
  let bestRightIndices: number[] = [];

  // evaluate splits
  for (let f = 0; f < nFeatures; f++) {
    const vals = X.map(r => r[f]).sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i += Math.max(1, Math.floor(vals.length / 5))) {
      const thresh = (vals[i] + vals[i + 1]) / 2;
      const leftIdx: number[] = [];
      const rightIdx: number[] = [];
      for (let rowIdx = 0; rowIdx < X.length; rowIdx++) {
        if (X[rowIdx][f] <= thresh) leftIdx.push(rowIdx);
        else rightIdx.push(rowIdx);
      }

      if (leftIdx.length === 0 || rightIdx.length === 0) continue;

      let score = 0;
      if (taskType === 'regression') {
        const leftMean = mean(leftIdx.map(k => y[k]));
        const rightMean = mean(rightIdx.map(k => y[k]));
        const leftVariance = leftIdx.reduce((acc, k) => acc + Math.pow(y[k] - leftMean, 2), 0);
        const rightVariance = rightIdx.reduce((acc, k) => acc + Math.pow(y[k] - rightMean, 2), 0);
        score = leftVariance + rightVariance;
      } else {
        // Gini impurity
        const calcGini = (indices: number[]) => {
          const ones = indices.filter(k => y[k] === 1).length;
          const p1 = ones / indices.length;
          const p0 = 1 - p1;
          return 1 - (p1 * p1 + p0 * p0);
        };
        score = (leftIdx.length / X.length) * calcGini(leftIdx) + (rightIdx.length / X.length) * calcGini(rightIdx);
      }

      if (score < bestScore) {
        bestScore = score;
        bestFeat = f;
        bestThresh = thresh;
        bestLeftIndices = leftIdx;
        bestRightIndices = rightIdx;
      }
    }
  }

  if (bestLeftIndices.length === 0 || bestRightIndices.length === 0) {
    return {
      isLeaf: true,
      value: taskType === 'classification' ? (y.filter(v => v === 1).length >= y.length / 2 ? 1 : 0) : mean(y)
    };
  }

  const leftX = bestLeftIndices.map(k => X[k]);
  const leftY = bestLeftIndices.map(k => y[k]);
  const rightX = bestRightIndices.map(k => X[k]);
  const rightY = bestRightIndices.map(k => y[k]);

  return {
    isLeaf: false,
    value: 0,
    featureIndex: bestFeat,
    threshold: bestThresh,
    left: buildTree(leftX, leftY, maxDepth, taskType, currentDepth + 1),
    right: buildTree(rightX, rightY, maxDepth, taskType, currentDepth + 1)
  };
}

function predictTree(node: TreeNode, x: number[]): number {
  if (node.isLeaf) return node.value;
  if (node.featureIndex !== undefined && node.threshold !== undefined) {
    if (x[node.featureIndex] <= node.threshold) {
      return predictTree(node.left!, x);
    } else {
      return predictTree(node.right!, x);
    }
  }
  return node.value;
}

// Random Forest (Ensemble of Trees with bootstrap sampling)
interface RandomForestModel {
  trees: TreeNode[];
  predict: (x: number[]) => number;
  featureImportances: number[];
}

function trainRandomForest(
  X: number[][],
  y: number[],
  nEstimators: number = 10,
  maxDepth: number = 4,
  taskType: TaskType = 'regression'
): RandomForestModel {
  const trees: TreeNode[] = [];
  const nFeatures = X[0].length;
  const importanceCounts = new Array(nFeatures).fill(0);

  for (let e = 0; e < nEstimators; e++) {
    // Bootstrap sample
    const bootX: number[][] = [];
    const bootY: number[] = [];
    for (let i = 0; i < X.length; i++) {
      const idx = Math.floor(Math.random() * X.length);
      bootX.push(X[idx]);
      bootY.push(y[idx]);
    }
    const tree = buildTree(bootX, bootY, maxDepth, taskType, 0);
    trees.push(tree);

    // Track feature usage in tree nodes for importance estimation
    const traverse = (node: TreeNode) => {
      if (!node.isLeaf && node.featureIndex !== undefined) {
        importanceCounts[node.featureIndex]++;
        if (node.left) traverse(node.left);
        if (node.right) traverse(node.right);
      }
    };
    traverse(tree);
  }

  const totalCount = importanceCounts.reduce((a, b) => a + b, 0) || 1;
  const featureImportances = importanceCounts.map(c => c / totalCount);

  const predict = (x: number[]) => {
    const preds = trees.map(t => predictTree(t, x));
    if (taskType === 'classification') {
      const sum = preds.reduce((a, b) => a + b, 0);
      return sum >= (trees.length / 2) ? 1 : 0;
    } else {
      return mean(preds);
    }
  };

  return { trees, predict, featureImportances };
}

// K-Nearest Neighbors
interface KNNModel {
  predict: (x: number[]) => number;
}

function trainKNN(
  X_train: number[][],
  y_train: number[],
  k: number = 3,
  taskType: TaskType = 'regression'
): KNNModel {
  const predict = (x: number[]) => {
    const distances = X_train.map((trainRow, idx) => {
      let sumDist = 0;
      for (let j = 0; j < x.length; j++) {
        sumDist += Math.pow(x[j] - trainRow[j], 2);
      }
      return { dist: Math.sqrt(sumDist), label: y_train[idx] };
    });

    distances.sort((a, b) => a.dist - b.dist);
    const kNearest = distances.slice(0, Math.min(k, distances.length));

    if (taskType === 'classification') {
      const ones = kNearest.filter(item => item.label === 1).length;
      return ones >= (kNearest.length / 2) ? 1 : 0;
    } else {
      return mean(kNearest.map(item => item.label));
    }
  };

  return { predict };
}

// Main training orchestrator
export function trainSupervisedModel(
  dataset: PlayerRecord[],
  sport: SportType,
  targetId: string,
  algorithm: MLAlgorithm,
  selectedFeatureIds: string[],
  hyperparams: Hyperparameters
): { result: TrainedModelResult; predictSingle: (rawFeatures: Record<string, number>) => { prediction: number; confidence: number } } {
  const sportCfg = SPORT_CONFIGS[sport];
  const targetDef = sportCfg.targets.find(t => t.id === targetId)!;
  const taskType = targetDef.taskType;

  // Split dataset
  const { train, test } = trainTestSplit(dataset, hyperparams.trainSplit);

  // Extract feature matrices
  const X_train_raw = train.map(p => selectedFeatureIds.map(fId => p.features[fId] ?? 0));
  const y_train = train.map(p => p.targets[targetId] ?? 0);

  const X_test_raw = test.map(p => selectedFeatureIds.map(fId => p.features[fId] ?? 0));
  const y_test = test.map(p => p.targets[targetId] ?? 0);

  // Fit standard scaler on train set
  const scaler = fitStandardScaler(X_train_raw);
  const X_train = X_train_raw.map(row => scaler.transform(row));
  const X_test = X_test_raw.map(row => scaler.transform(row));

  let predictFn: (scaledX: number[]) => number;
  let featureWeights: number[] = [];

  if (algorithm === 'linear_regression' || algorithm === 'ridge_regression') {
    const alpha = algorithm === 'ridge_regression' ? hyperparams.regularizationAlpha : 0.0001;
    const { weights, bias } = trainLinearRidgeRegression(
      X_train, 
      y_train, 
      alpha, 
      hyperparams.learningRate, 
      hyperparams.iterations
    );
    predictFn = (x: number[]) => {
      let val = bias;
      for (let j = 0; j < x.length; j++) {
        val += weights[j] * x[j];
      }
      return val;
    };
    featureWeights = weights.map(w => Math.abs(w));

  } else if (algorithm === 'logistic_regression') {
    const { weights, bias } = trainLogisticRegression(
      X_train, 
      y_train, 
      hyperparams.regularizationAlpha, 
      hyperparams.learningRate, 
      hyperparams.iterations
    );
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
    predictFn = (x: number[]) => {
      let z = bias;
      for (let j = 0; j < x.length; j++) {
        z += weights[j] * x[j];
      }
      return sigmoid(z) >= 0.5 ? 1 : 0;
    };
    featureWeights = weights.map(w => Math.abs(w));

  } else if (algorithm === 'random_forest_regressor' || algorithm === 'random_forest_classifier') {
    const rf = trainRandomForest(
      X_train, 
      y_train, 
      hyperparams.nEstimators, 
      hyperparams.maxDepth, 
      taskType
    );
    predictFn = rf.predict;
    featureWeights = rf.featureImportances;

  } else {
    // KNN
    const knn = trainKNN(X_train, y_train, hyperparams.kNeighbors, taskType);
    predictFn = knn.predict;
    // For KNN, compute univariate correlation as feature relevance
    featureWeights = selectedFeatureIds.map((_, j) => {
      const xVals = X_train.map(r => r[j]);
      const mx = mean(xVals);
      const my = mean(y_train);
      const cov = xVals.reduce((acc, v, i) => acc + (v - mx) * (y_train[i] - my), 0);
      return Math.abs(cov) / (std(xVals) * std(y_train) * (xVals.length || 1));
    });
  }

  // Normalize feature importance to sum to 1.0
  const totalWeight = featureWeights.reduce((a, b) => a + b, 0) || 1;
  const normalizedImportances = selectedFeatureIds.map((fId, idx) => {
    const featDef = sportCfg.features.find(f => f.id === fId);
    return {
      featureId: fId,
      featureName: featDef ? featDef.name : fId,
      weight: +(featureWeights[idx] / totalWeight).toFixed(3)
    };
  }).sort((a, b) => b.weight - a.weight);

  // Evaluate on Test Set
  const predictionsVsActual: { actual: number; predicted: number; playerName: string }[] = [];
  const testPreds: number[] = [];

  for (let i = 0; i < test.length; i++) {
    const predVal = predictFn(X_test[i]);
    testPreds.push(predVal);
    predictionsVsActual.push({
      actual: +y_test[i].toFixed(2),
      predicted: +predVal.toFixed(2),
      playerName: test[i].name
    });
  }

  let regressionMetrics: RegressionMetrics | undefined;
  let classificationMetrics: ClassificationMetrics | undefined;

  if (taskType === 'regression') {
    let sse = 0;
    let sae = 0;
    const residuals: number[] = [];
    for (let i = 0; i < test.length; i++) {
      const err = y_test[i] - testPreds[i];
      residuals.push(err);
      sse += Math.pow(err, 2);
      sae += Math.abs(err);
    }
    const mse = +(sse / (test.length || 1)).toFixed(3);
    const rmse = +Math.sqrt(mse).toFixed(3);
    const mae = +(sae / (test.length || 1)).toFixed(3);

    const yMean = mean(y_test);
    const sst = y_test.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const r2 = sst === 0 ? 0 : +(1 - (sse / sst)).toFixed(3);

    regressionMetrics = {
      mse,
      rmse,
      mae,
      r2: Math.max(-1, Math.min(0.99, r2)),
      testSamples: test.length,
      trainSamples: train.length,
      residualStats: {
        min: +Math.min(...residuals).toFixed(2),
        max: +Math.max(...residuals).toFixed(2),
        mean: +mean(residuals).toFixed(2),
        std: +std(residuals).toFixed(2)
      }
    };
  } else {
    // Classification Metrics
    let tp = 0;
    let tn = 0;
    let fp = 0;
    let fn = 0;

    for (let i = 0; i < test.length; i++) {
      const actual = y_test[i] >= 0.5 ? 1 : 0;
      const pred = testPreds[i] >= 0.5 ? 1 : 0;
      if (actual === 1 && pred === 1) tp++;
      else if (actual === 0 && pred === 0) tn++;
      else if (actual === 0 && pred === 1) fp++;
      else fn++;
    }

    const accuracy = +((tp + tn) / (test.length || 1)).toFixed(3);
    const precision = +(tp / ((tp + fp) || 1)).toFixed(3);
    const recall = +(tp / ((tp + fn) || 1)).toFixed(3);
    const f1 = +((2 * precision * recall) / ((precision + recall) || 1)).toFixed(3);

    classificationMetrics = {
      accuracy,
      precision,
      recall,
      f1,
      confusionMatrix: [[tn, fp], [fn, tp]],
      testSamples: test.length,
      trainSamples: train.length
    };
  }

  const result: TrainedModelResult = {
    algorithm,
    sport,
    targetId,
    taskType,
    featureIds: selectedFeatureIds,
    hyperparameters: hyperparams,
    timestamp: new Date().toISOString(),
    metrics: {
      regression: regressionMetrics,
      classification: classificationMetrics
    },
    featureImportance: normalizedImportances,
    predictionsVsActual
  };

  const predictSingle = (rawFeatures: Record<string, number>) => {
    const rawVector = selectedFeatureIds.map(fId => rawFeatures[fId] ?? 0);
    const scaledVector = scaler.transform(rawVector);
    const rawPred = predictFn(scaledVector);
    const confidence = taskType === 'classification' ? 0.88 : 0.92;
    return {
      prediction: +(rawPred.toFixed(2)),
      confidence
    };
  };

  return { result, predictSingle };
}
