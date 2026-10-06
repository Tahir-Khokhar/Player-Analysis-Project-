import React, { useState } from 'react';
import { PlayerRecord, TrainedModelResult, SportType } from '../types/sports-ml';
import { SPORT_CONFIGS } from '../data/sports-datasets';
import { Send, Copy, Check, Terminal, Play, Key, RefreshCw } from 'lucide-react';

interface ApiPlaygroundProps {
  currentSport: SportType;
  dataset: PlayerRecord[];
  trainedModel: TrainedModelResult | null;
  predictFn: ((features: Record<string, number>) => { prediction: number; confidence: number }) | null;
  externalPayload?: {
    sport: string;
    algorithm: string;
    target_name: string;
    features: Record<string, number>;
  } | null;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  name: string;
  description: string;
  defaultPayload?: any;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({
  currentSport,
  dataset,
  trainedModel,
  predictFn,
  externalPayload,
}) => {
  const sportCfg = SPORT_CONFIGS[currentSport];

  const endpoints: EndpointDef[] = [
    {
      id: 'ml_predict',
      method: 'POST',
      path: '/api/v1/ml/predict/',
      name: 'Supervised ML Inference',
      description: 'Predict player stat using active Scikit-Learn trained pipeline.',
      defaultPayload: externalPayload || {
        sport: currentSport,
        algorithm: trainedModel?.algorithm || 'random_forest_regressor',
        target_name: trainedModel?.targetId || sportCfg.targets[0].id,
        features: {
          [sportCfg.features[0].id]: sportCfg.features[0].defaultValue,
          [sportCfg.features[1].id]: sportCfg.features[1].defaultValue,
          [sportCfg.features[2].id]: sportCfg.features[2].defaultValue,
          ...(sportCfg.features[3] ? { [sportCfg.features[3].id]: sportCfg.features[3].defaultValue } : {})
        }
      }
    },
    {
      id: 'ml_train',
      method: 'POST',
      path: '/api/v1/ml/train/',
      name: 'Trigger ML Training Pipeline',
      description: 'Extract Django ORM records, split train/test, train estimator & save Joblib artifact.',
      defaultPayload: {
        sport: currentSport,
        algorithm: 'random_forest_regressor',
        target_name: sportCfg.targets[0].id,
        task_type: 'regression',
        feature_keys: sportCfg.features.slice(0, 4).map(f => f.id),
        hyperparameters: {
          n_estimators: 25,
          max_depth: 4,
          test_size: 0.25
        }
      }
    },
    {
      id: 'ml_registry',
      method: 'GET',
      path: '/api/v1/ml/registry/',
      name: 'Model Catalog & Registry',
      description: 'Retrieve all supported sports categories and available supervised estimators.'
    },
    {
      id: 'players_roster',
      method: 'GET',
      path: '/api/v1/players/roster/?sport=' + currentSport,
      name: 'List Players (Django ORM)',
      description: 'Query paginated players roster with relational match statistics.'
    },
    {
      id: 'auth_token',
      method: 'POST',
      path: '/api/v1/auth/token/',
      name: 'Obtain DRF Auth Token',
      description: 'Exchange sports analyst credentials for API access token.',
      defaultPayload: {
        username: 'analyst_pro',
        password: 'SportsAnalyticsSecret2026!'
      }
    }
  ];

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('ml_predict');
  const activeEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(activeEndpoint.defaultPayload || {}, null, 2)
  );
  const [authToken, setAuthToken] = useState('Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [loading, setLoading] = useState(false);

  // Response state
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    const ep = endpoints.find(e => e.id === endpointId);
    if (ep?.defaultPayload) {
      setPayloadText(JSON.stringify(ep.defaultPayload, null, 2));
    } else {
      setPayloadText('{}');
    }
    setResponseStatus(null);
    setResponseData(null);
  };

  const handleExecuteRequest = () => {
    setLoading(true);
    const start = performance.now();

    setTimeout(() => {
      let parsedPayload: any = {};
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (e) {
        setResponseStatus(400);
        setResponseStatusText('BAD REQUEST');
        setResponseData({ error: 'Malformed JSON payload syntax.' });
        setResponseTime(Math.round(performance.now() - start));
        setLoading(false);
        return;
      }

      // Route simulation based on endpoint
      if (activeEndpoint.id === 'ml_predict') {
        const inputFeatures = parsedPayload.features || {};
        let predictedVal = 26.4;
        if (predictFn) {
          const res = predictFn(inputFeatures);
          predictedVal = res.prediction;
        }

        setResponseStatus(200);
        setResponseStatusText('OK');
        setResponseData({
          sport: parsedPayload.sport || currentSport,
          algorithm: parsedPayload.algorithm || 'random_forest_regressor',
          target: parsedPayload.target_name || 'points_predicted',
          prediction: predictedVal,
          prediction_interval_95: {
            lower_bound: +(predictedVal - 3.2).toFixed(2),
            upper_bound: +(predictedVal + 3.2).toFixed(2)
          },
          inference_timestamp: new Date().toISOString(),
          backend_framework: 'Django REST Framework 3.15.1 + Scikit-Learn 1.4.2'
        });

      } else if (activeEndpoint.id === 'ml_train') {
        setResponseStatus(201);
        setResponseStatusText('CREATED');
        setResponseData({
          status: 'success',
          model_file: `${parsedPayload.sport}_${parsedPayload.algorithm}_${parsedPayload.target_name}.joblib`,
          metrics: {
            mse: 4.821,
            rmse: 2.195,
            mae: 1.742,
            r2_score: 0.884,
            test_samples: 8,
            train_samples: 24
          },
          feature_importance: [
            { feature: parsedPayload.feature_keys?.[0] || 'minutes', importance: 0.382 },
            { feature: parsedPayload.feature_keys?.[1] || 'usage_rate', importance: 0.294 },
            { feature: parsedPayload.feature_keys?.[2] || 'true_shooting_pct', importance: 0.185 },
            { feature: parsedPayload.feature_keys?.[3] || 'rest_days', importance: 0.139 }
          ],
          artifact_path: `/app/ml_engine/saved_models/${parsedPayload.sport}_${parsedPayload.algorithm}_${parsedPayload.target_name}.joblib`
        });

      } else if (activeEndpoint.id === 'ml_registry') {
        setResponseStatus(200);
        setResponseStatusText('OK');
        setResponseData({
          supported_sports: ['basketball', 'soccer', 'cricket', 'baseball'],
          algorithms: {
            regression: [
              { id: 'linear_regression', name: 'Linear Regression (OLS)' },
              { id: 'ridge_regression', name: 'Ridge Regression (L2 Regularized)' },
              { id: 'random_forest_regressor', name: 'Random Forest Regressor' },
              { id: 'gradient_boosting', name: 'Gradient Boosting Regressor' },
              { id: 'knn', name: 'K-Nearest Neighbors Regressor' }
            ],
            classification: [
              { id: 'logistic_regression', name: 'Logistic Regression' },
              { id: 'random_forest_classifier', name: 'Random Forest Classifier' },
              { id: 'knn', name: 'K-Nearest Neighbors Classifier' }
            ]
          }
        });

      } else if (activeEndpoint.id === 'players_roster') {
        setResponseStatus(200);
        setResponseStatusText('OK');
        setResponseData({
          count: dataset.length,
          next: null,
          previous: null,
          results: dataset.slice(0, 5).map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            sport: p.sport,
            position: p.position,
            age: p.age,
            recent_stats_count: 12,
            created_at: '2026-03-15T10:00:00Z'
          }))
        });

      } else if (activeEndpoint.id === 'auth_token') {
        setResponseStatus(200);
        setResponseStatusText('OK');
        setResponseData({
          token: '9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b',
          user_id: 1,
          email: 'analyst_pro@sportsanalytics.io'
        });
      }

      setResponseTime(Math.round(performance.now() - start + 8));
      setLoading(false);
    }, 120);
  };

  const getCurlSnippet = () => {
    if (activeEndpoint.method === 'GET') {
      return `curl -X GET "http://localhost:8000${activeEndpoint.path}" \\
  -H "Authorization: ${authToken}" \\
  -H "Accept: application/json"`;
    }
    return `curl -X POST "http://localhost:8000${activeEndpoint.path}" \\
  -H "Authorization: ${authToken}" \\
  -H "Content-Type: application/json" \\
  -d '${payloadText.replace(/'/g, "\\'")}'`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Swagger & ReDoc Simulator</span>
              <span aria-hidden="true">·</span>
              <span>Django REST Framework 3.15</span>
              <span aria-hidden="true">·</span>
              <span>OpenAPI 3.0 Schema</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              DRF API Interactive Client & Test Runner
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Execute live REST requests against Django endpoints. Inspect HTTP response statuses, JSON serializations, and copy cURL commands directly into your terminal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(getCurlSnippet())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Endpoint list on left, Request/Response on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Nav (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider px-1">
              Available DRF Endpoints
            </span>

            <div className="space-y-1.5">
              {endpoints.map((ep) => {
                const isSelected = selectedEndpointId === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-xs'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                        ep.method === 'GET' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {ep.name}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 truncate">
                      {ep.path}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Token Auth Box */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authorization Header</span>
            </div>
            <input
              type="text"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Request & Response View (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Endpoint Banner & Send */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-mono font-bold rounded ${
                activeEndpoint.method === 'GET' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {activeEndpoint.method}
              </span>
              <span className="font-mono text-sm font-semibold text-white">
                {activeEndpoint.path}
              </span>
            </div>

            <button
              onClick={handleExecuteRequest}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Request Body (for POST) */}
          {activeEndpoint.method === 'POST' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Request Body (JSON)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  application/json
                </span>
              </div>
              <textarea
                rows={8}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-slate-700"
              />
            </div>
          )}

          {/* Response Viewer */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  Server Response
                </span>
                {responseStatus && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                    responseStatus >= 200 && responseStatus < 300 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {responseStatus} {responseStatusText}
                  </span>
                )}
              </div>

              {responseTime !== null && (
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  Latency: {responseTime} ms
                </span>
              )}
            </div>

            {responseData ? (
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto max-h-80">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 font-sans">
                Click "Send Request" to invoke the Django REST Framework endpoint and inspect output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
