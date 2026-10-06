import { DjangoFile } from '../types/sports-ml';

export const DJANGO_PROJECT_FILES: DjangoFile[] = [
  {
    path: 'manage.py',
    name: 'manage.py',
    category: 'core',
    language: 'python',
    description: 'Django management entry point for running commands, migrations, and development server.',
    content: `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sports_analytics_api.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    category: 'config',
    language: 'text',
    description: 'Python package dependencies including Django, DRF, Scikit-learn, Pandas, and Joblib.',
    content: `Django>=5.0.3,<5.2.0
djangorestframework>=3.15.1
django-cors-headers>=4.3.1
django-filter>=24.2
drf-spectacular>=0.27.1
scikit-learn>=1.4.2
pandas>=2.2.1
numpy>=1.26.4
joblib>=1.3.2
psycopg2-binary>=2.9.9
gunicorn>=21.2.0
python-dotenv>=1.0.1
`
  },
  {
    path: 'sports_analytics_api/settings.py',
    name: 'settings.py',
    category: 'core',
    language: 'python',
    description: 'Main Django settings configured with DRF, authentication, CORS, and ML artifact paths.',
    content: `import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-sports-ml-analytics-production-key-2026')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party applications
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'drf_spectacular',

    # Local sports & ML apps
    'players.apps.PlayersConfig',
    'ml_engine.apps.MlEngineConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sports_analytics_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sports_analytics_api.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# OpenAPI Swagger Documentation Configuration
SPECTACULAR_SETTINGS = {
    'TITLE': 'Sports Analytics & Supervised ML Engine API',
    'DESCRIPTION': 'REST API for player telemetry tracking, supervised learning model training, and performance forecasting.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ML Models Persistence Directory
ML_MODELS_DIR = BASE_DIR / 'ml_engine' / 'saved_models'
os.makedirs(ML_MODELS_DIR, exist_ok=True)

CORS_ALLOW_ALL_ORIGINS = True
`
  },
  {
    path: 'sports_analytics_api/urls.py',
    name: 'urls.py',
    category: 'core',
    language: 'python',
    description: 'Root URL routing connecting player endpoints, ML prediction views, and Swagger documentation.',
    content: `from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth Token Endpoint
    path('api/v1/auth/token/', obtain_auth_token, name='api_token_auth'),
    
    # OpenAPI Schema & Interactive UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Application Routes
    path('api/v1/players/', include('players.urls')),
    path('api/v1/ml/', include('ml_engine.urls')),
]
`
  },
  {
    path: 'players/models.py',
    name: 'players/models.py',
    category: 'models',
    language: 'python',
    description: 'Django ORM models representing sports categories, players, and granular match statistical logs.',
    content: `from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class SportType(models.TextChoices):
    BASKETBALL = 'basketball', 'Basketball'
    SOCCER = 'soccer', 'Football (Soccer)'
    CRICKET = 'cricket', 'Cricket'
    BASEBALL = 'baseball', 'Baseball'

class Player(models.Model):
    name = models.CharField(max_length=120, db_index=True)
    sport = models.CharField(max_length=30, choices=SportType.choices, default=SportType.BASKETBALL, db_index=True)
    team = models.CharField(max_length=100)
    position = models.CharField(max_length=50)
    age = models.PositiveSmallIntegerField(validators=[MinValueValidator(15), MaxValueValidator(50)])
    jersey_number = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['sport', 'team']),
        ]

    def __str__(self):
        return f"{self.name} ({self.team} - {self.get_sport_display()})"


class MatchStat(models.Model):
    """
    Granular statistical telemetry log for a specific player during a single game fixture.
    """
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='match_stats')
    match_date = models.DateField(db_index=True)
    opponent_team = models.CharField(max_length=100)
    home_game = models.BooleanField(default=True)
    
    # General match telemetry
    minutes_played = models.FloatField(validators=[MinValueValidator(0.0)], default=0.0)
    rest_days_prior = models.PositiveSmallIntegerField(default=2)
    opponent_defensive_rating = models.FloatField(default=110.0)
    
    # Flexible sports telemetry stored in JSON format for multi-sport scalability
    # e.g. Basketball: { "points": 28, "usage_rate": 29.5, "true_shooting_pct": 61.2, "assists": 8 }
    # e.g. Soccer: { "xg": 0.85, "pass_completion_pct": 86.4, "distance_km": 11.2, "sprints": 32 }
    raw_metrics = models.JSONField(default=dict, help_text="Flexible key-value sports metrics")
    
    # Supervised Targets
    actual_score_impact = models.FloatField(default=0.0, help_text="Observed performance target")
    is_clutch_winner = models.BooleanField(default=False, help_text="Binary target for high-leverage contribution")
    experienced_injury_fatigue = models.BooleanField(default=False)

    class Meta:
        ordering = ['-match_date']
        indexes = [
            models.Index(fields=['player', 'match_date']),
        ]

    def __str__(self):
        return f"{self.player.name} vs {self.opponent_team} on {self.match_date}"
`
  },
  {
    path: 'players/serializers.py',
    name: 'players/serializers.py',
    category: 'serializers',
    language: 'python',
    description: 'DRF serializers with nested relationships, field validation, and calculated aggregations.',
    content: `from rest_framework import serializers
from .models import Player, MatchStat

class MatchStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchStat
        fields = [
            'id', 'player', 'match_date', 'opponent_team', 'home_game',
            'minutes_played', 'rest_days_prior', 'opponent_defensive_rating',
            'raw_metrics', 'actual_score_impact', 'is_clutch_winner',
            'experienced_injury_fatigue'
        ]

    def validate_minutes_played(self, value):
        if value < 0:
            raise serializers.ValidationError("Minutes played cannot be negative.")
        return value


class PlayerSerializer(serializers.ModelSerializer):
    recent_stats_count = serializers.IntegerField(source='match_stats.count', read_only=True)

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'sport', 'team', 'position', 'age',
            'jersey_number', 'recent_stats_count', 'created_at'
        ]


class PlayerDetailSerializer(serializers.ModelSerializer):
    match_stats = MatchStatSerializer(many=True, read_only=True)
    career_avg_impact = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'sport', 'team', 'position', 'age',
            'jersey_number', 'career_avg_impact', 'match_stats'
        ]

    def get_career_avg_impact(self, obj):
        stats = obj.match_stats.all()
        if not stats.exists():
            return 0.0
        return round(sum(s.actual_score_impact for s in stats) / stats.count(), 2)
`
  },
  {
    path: 'players/views.py',
    name: 'players/views.py',
    category: 'views',
    language: 'python',
    description: 'DRF ModelViewSets for players and stats with filtering, searching, and custom actions.',
    content: `from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Player, MatchStat
from .serializers import PlayerSerializer, PlayerDetailSerializer, MatchStatSerializer

class PlayerViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Sports Players. Filter by sport, team, or position.
    """
    queryset = Player.objects.all().prefetch_related('match_stats')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sport', 'team', 'position']
    search_fields = ['name', 'team']
    ordering_fields = ['name', 'age', 'created_at']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PlayerDetailSerializer
        return PlayerSerializer


class MatchStatViewSet(viewsets.ModelViewSet):
    """
    Log and retrieve granular match performances for players.
    """
    queryset = MatchStat.objects.all().select_related('player')
    serializer_class = MatchStatSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['player', 'home_game', 'is_clutch_winner']
    ordering_fields = ['match_date', 'minutes_played', 'actual_score_impact']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
`
  },
  {
    path: 'players/urls.py',
    name: 'players/urls.py',
    category: 'views',
    language: 'python',
    description: 'Router registration for Players and Match Stats REST endpoints.',
    content: `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet, MatchStatViewSet

router = DefaultRouter()
router.register(r'roster', PlayerViewSet, basename='player')
router.register(r'match-stats', MatchStatViewSet, basename='match-stat')

urlpatterns = [
    path('', include(router.urls)),
]
`
  },
  {
    path: 'ml_engine/supervised_models.py',
    name: 'supervised_models.py',
    category: 'ml',
    language: 'python',
    description: 'Catalog of Scikit-Learn supervised learning estimators wrapped for sports regression & classification.',
    content: `"""
Catalog of Scikit-Learn Supervised Learning Models for Sports Player Analytics.
"""
from sklearn.linear_model import LinearRegression, Ridge, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier

def get_supervised_model(algorithm_name: str, task_type: str = 'regression', hyperparams: dict = None):
    """
    Factory function returning an instantiated Scikit-Learn estimator.
    """
    params = hyperparams or {}
    
    if task_type == 'regression':
        if algorithm_name == 'linear_regression':
            return LinearRegression()
        elif algorithm_name == 'ridge_regression':
            alpha = float(params.get('regularization_alpha', 1.0))
            return Ridge(alpha=alpha)
        elif algorithm_name == 'random_forest_regressor':
            n_estimators = int(params.get('n_estimators', 50))
            max_depth = int(params.get('max_depth', 5))
            return RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
        elif algorithm_name == 'gradient_boosting':
            return GradientBoostingRegressor(
                n_estimators=int(params.get('n_estimators', 50)),
                learning_rate=float(params.get('learning_rate', 0.1)),
                max_depth=int(params.get('max_depth', 4)),
                random_state=42
            )
        elif algorithm_name == 'knn':
            k = int(params.get('k_neighbors', 5))
            return KNeighborsRegressor(n_neighbors=k)
        else:
            raise ValueError(f"Unsupported regression algorithm: {algorithm_name}")

    elif task_type == 'classification':
        if algorithm_name == 'logistic_regression':
            c_val = 1.0 / max(0.001, float(params.get('regularization_alpha', 1.0)))
            return LogisticRegression(C=c_val, max_iter=1000, random_state=42)
        elif algorithm_name == 'random_forest_classifier':
            n_estimators = int(params.get('n_estimators', 50))
            max_depth = int(params.get('max_depth', 5))
            return RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
        elif algorithm_name == 'knn':
            k = int(params.get('k_neighbors', 5))
            return KNeighborsClassifier(n_neighbors=k)
        else:
            raise ValueError(f"Unsupported classification algorithm: {algorithm_name}")
            
    else:
        raise ValueError(f"Unknown task type: {task_type}")
`
  },
  {
    path: 'ml_engine/train_pipeline.py',
    name: 'train_pipeline.py',
    category: 'ml',
    language: 'python',
    description: 'Scikit-Learn training pipeline: ORM data extraction, train/test split, metrics calculation, and Joblib artifact serialization.',
    content: `import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from django.conf import settings
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from players.models import Player, MatchStat
from .supervised_models import get_supervised_model

class SportsModelTrainingPipeline:
    def __init__(self, sport: str, target_name: str, algorithm: str, feature_keys: list, task_type: str = 'regression', hyperparams: dict = None):
        self.sport = sport
        self.target_name = target_name
        self.algorithm = algorithm
        self.feature_keys = feature_keys
        self.task_type = task_type
        self.hyperparams = hyperparams or {}

    def extract_dataset(self) -> pd.DataFrame:
        """
        Queries Django ORM database for match records of the specified sport and builds a structured Pandas DataFrame.
        """
        stats_qs = MatchStat.objects.filter(player__sport=self.sport).select_related('player')
        
        data_rows = []
        for stat in stats_qs:
            row = {
                'player_id': stat.player.id,
                'player_name': stat.player.name,
                'minutes_played': stat.minutes_played,
                'rest_days': stat.rest_days_prior,
                'opp_def_rating': stat.opponent_defensive_rating,
                'target_actual_score': stat.actual_score_impact,
                'target_clutch_winner': 1 if stat.is_clutch_winner else 0,
                'target_injury_risk': 1 if stat.experienced_injury_fatigue else 0,
            }
            # Unpack JSON metrics into columns
            for k, v in stat.raw_metrics.items():
                row[k] = v
            data_rows.append(row)

        df = pd.DataFrame(data_rows)
        return df

    def train_and_evaluate(self):
        df = self.extract_dataset()
        if df.empty or len(df) < 10:
            raise ValueError(f"Insufficient training records for sport '{self.sport}'. At least 10 match stats required.")

        # Ensure all feature keys exist
        for key in self.feature_keys:
            if key not in df.columns:
                df[key] = 0.0

        X = df[self.feature_keys].values
        
        # Select target
        if self.target_name == 'clutch_winner':
            y = df['target_clutch_winner'].values
        elif self.target_name == 'injury_risk':
            y = df['target_injury_risk'].values
        else:
            y = df['target_actual_score'].values

        test_size = float(self.hyperparams.get('test_size', 0.25))
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

        # Build Scikit-Learn Pipeline
        base_estimator = get_supervised_model(self.algorithm, self.task_type, self.hyperparams)
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', base_estimator)
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        # Compute Metrics
        metrics = {}
        if self.task_type == 'regression':
            mse = float(mean_squared_error(y_test, y_pred))
            metrics = {
                'mse': round(mse, 4),
                'rmse': round(np.sqrt(mse), 4),
                'mae': round(float(mean_absolute_error(y_test, y_pred)), 4),
                'r2_score': round(float(r2_score(y_test, y_pred)), 4),
                'test_samples': len(y_test),
                'train_samples': len(y_train),
            }
        else:
            metrics = {
                'accuracy': round(float(accuracy_score(y_test, y_pred)), 4),
                'precision': round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
                'recall': round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
                'f1_score': round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
                'test_samples': len(y_test),
                'train_samples': len(y_train),
            }

        # Calculate Feature Importances
        model_step = pipeline.named_steps['model']
        feature_importance = []
        if hasattr(model_step, 'feature_importances_'):
            raw_weights = model_step.feature_importances_
            feature_importance = [
                {'feature': feat, 'importance': round(float(weight), 4)}
                for feat, weight in zip(self.feature_keys, raw_weights)
            ]
        elif hasattr(model_step, 'coef_'):
            coefs = model_step.coef_.ravel()
            total = sum(abs(c) for c in coefs) or 1.0
            feature_importance = [
                {'feature': feat, 'importance': round(float(abs(c) / total), 4)}
                for feat, c in zip(self.feature_keys, coefs)
            ]

        # Serialize Model to Disk via Joblib
        model_filename = f"{self.sport}_{self.algorithm}_{self.target_name}.joblib"
        artifact_path = os.path.join(settings.ML_MODELS_DIR, model_filename)
        
        artifact_metadata = {
            'pipeline': pipeline,
            'sport': self.sport,
            'algorithm': self.algorithm,
            'target_name': self.target_name,
            'task_type': self.task_type,
            'feature_keys': self.feature_keys,
            'metrics': metrics,
            'trained_at': datetime.utcnow().isoformat(),
        }
        joblib.dump(artifact_metadata, artifact_path)

        return {
            'status': 'success',
            'model_file': model_filename,
            'metrics': metrics,
            'feature_importance': sorted(feature_importance, key=lambda x: x['importance'], reverse=True)
        }
`
  },
  {
    path: 'ml_engine/predict_pipeline.py',
    name: 'predict_pipeline.py',
    category: 'ml',
    language: 'python',
    description: 'Inference engine that loads serialized Joblib models, validates inputs, and returns predictions with confidence intervals.',
    content: `import os
import joblib
import numpy as np
from django.conf import settings

_LOADED_MODELS = {}

def get_or_load_model(sport: str, algorithm: str, target_name: str) -> dict:
    """
    Cached model loader to maximize inference throughput in production.
    """
    key = f"{sport}_{algorithm}_{target_name}"
    if key in _LOADED_MODELS:
        return _LOADED_MODELS[key]

    model_filename = f"{sport}_{algorithm}_{target_name}.joblib"
    path = os.path.join(settings.ML_MODELS_DIR, model_filename)

    if not os.path.exists(path):
        raise FileNotFoundError(
            f"No trained model artifact found for sport='{sport}', algorithm='{algorithm}', target='{target_name}'. "
            f"Please run the training pipeline first via POST /api/v1/ml/train/."
        )

    metadata = joblib.load(path)
    _LOADED_MODELS[key] = metadata
    return metadata


def predict_player_stat(sport: str, algorithm: str, target_name: str, features_dict: dict) -> dict:
    """
    Performs inference for an individual player match scenario.
    """
    model_data = get_or_load_model(sport, algorithm, target_name)
    pipeline = model_data['pipeline']
    feature_keys = model_data['feature_keys']
    task_type = model_data['task_type']

    # Vectorize input in exact order of model features
    vector = []
    missing_features = []
    for f in feature_keys:
        if f in features_dict:
            vector.append(float(features_dict[f]))
        else:
            vector.append(0.0)
            missing_features.append(f)

    X_in = np.array([vector])
    raw_pred = pipeline.predict(X_in)[0]

    result = {
        'sport': sport,
        'algorithm': algorithm,
        'target': target_name,
        'task_type': task_type,
        'prediction': round(float(raw_pred), 3),
    }

    # If classification, compute probabilities if supported
    if task_type == 'classification' and hasattr(pipeline, 'predict_proba'):
        probs = pipeline.predict_proba(X_in)[0]
        result['class_probabilities'] = [round(float(p), 4) for p in probs]

    # Confidence interval for regression
    if task_type == 'regression':
        rmse = model_data.get('metrics', {}).get('rmse', 2.5)
        result['prediction_interval_95'] = {
            'lower_bound': round(float(raw_pred - 1.96 * rmse), 2),
            'upper_bound': round(float(raw_pred + 1.96 * rmse), 2),
        }

    return result
`
  },
  {
    path: 'ml_engine/serializers.py',
    name: 'ml_engine/serializers.py',
    category: 'serializers',
    language: 'python',
    description: 'DRF serializers for model training parameters, feature validation, and prediction requests.',
    content: `from rest_framework import serializers

class TrainModelRequestSerializer(serializers.Serializer):
    sport = serializers.ChoiceField(choices=['basketball', 'soccer', 'cricket', 'baseball'])
    algorithm = serializers.ChoiceField(choices=[
        'linear_regression', 'ridge_regression', 'random_forest_regressor',
        'gradient_boosting', 'logistic_regression', 'random_forest_classifier', 'knn'
    ])
    target_name = serializers.CharField(max_length=64, default='points_predicted')
    task_type = serializers.ChoiceField(choices=['regression', 'classification'], default='regression')
    feature_keys = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
        help_text="List of feature column names used for training."
    )
    hyperparameters = serializers.DictField(
        required=False,
        default=dict,
        help_text="Dictionary of model hyperparams (e.g. n_estimators, max_depth, alpha)."
    )


class PredictRequestSerializer(serializers.Serializer):
    sport = serializers.ChoiceField(choices=['basketball', 'soccer', 'cricket', 'baseball'])
    algorithm = serializers.CharField(max_length=64, default='random_forest_regressor')
    target_name = serializers.CharField(max_length=64, default='points_predicted')
    features = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Key-value pair of input feature names and numerical values."
    )
`
  },
  {
    path: 'ml_engine/views.py',
    name: 'ml_engine/views.py',
    category: 'views',
    language: 'python',
    description: 'DRF APIViews for invoking training, single/batch player predictions, and inspection of model registry.',
    content: `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import TrainModelRequestSerializer, PredictRequestSerializer
from .train_pipeline import SportsModelTrainingPipeline
from .predict_pipeline import predict_player_stat

class TrainModelAPIView(APIView):
    """
    POST: Train a supervised learning model on historical player stats and persist artifact.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        request=TrainModelRequestSerializer,
        responses={201: OpenApiResponse(description="Model successfully trained and persisted.")}
    )
    def post(self, request):
        serializer = TrainModelRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            pipeline = SportsModelTrainingPipeline(
                sport=data['sport'],
                target_name=data['target_name'],
                algorithm=data['algorithm'],
                feature_keys=data['feature_keys'],
                task_type=data['task_type'],
                hyperparams=data.get('hyperparameters', {})
            )
            result = pipeline.train_and_evaluate()
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PredictPlayerPerformanceAPIView(APIView):
    """
    POST: Perform real-time supervised prediction for player metrics given fixture context.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=PredictRequestSerializer,
        responses={200: OpenApiResponse(description="Prediction generated with confidence intervals.")}
    )
    def post(self, request):
        serializer = PredictRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            prediction_output = predict_player_stat(
                sport=data['sport'],
                algorithm=data['algorithm'],
                target_name=data['target_name'],
                features_dict=data['features']
            )
            return Response(prediction_output, status=status.HTTP_200_OK)
        except FileNotFoundError as fnf:
            return Response({'error': str(fnf)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ModelRegistryAPIView(APIView):
    """
    GET: Return available sports and supported supervised learning model options.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        catalog = {
            'supported_sports': ['basketball', 'soccer', 'cricket', 'baseball'],
            'algorithms': {
                'regression': [
                    {'id': 'linear_regression', 'name': 'Linear Regression (OLS)'},
                    {'id': 'ridge_regression', 'name': 'Ridge Regression (L2 Regularized)'},
                    {'id': 'random_forest_regressor', 'name': 'Random Forest Regressor'},
                    {'id': 'gradient_boosting', 'name': 'Gradient Boosting Regressor'},
                    {'id': 'knn', 'name': 'K-Nearest Neighbors Regressor'}
                ],
                'classification': [
                    {'id': 'logistic_regression', 'name': 'Logistic Regression'},
                    {'id': 'random_forest_classifier', 'name': 'Random Forest Classifier'},
                    {'id': 'knn', 'name': 'K-Nearest Neighbors Classifier'}
                ]
            }
        }
        return Response(catalog, status=status.HTTP_200_OK)
`
  },
  {
    path: 'ml_engine/urls.py',
    name: 'ml_engine/urls.py',
    category: 'views',
    language: 'python',
    description: 'URL routing for ML training, inference, and registry endpoints.',
    content: `from django.urls import path
from .views import TrainModelAPIView, PredictPlayerPerformanceAPIView, ModelRegistryAPIView

urlpatterns = [
    path('train/', TrainModelAPIView.as_view(), name='ml_train'),
    path('predict/', PredictPlayerPerformanceAPIView.as_view(), name='ml_predict'),
    path('registry/', ModelRegistryAPIView.as_view(), name='ml_registry'),
]
`
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    category: 'deploy',
    language: 'dockerfile',
    description: 'Production container setup running Gunicorn WSGI server.',
    content: `FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "sports_analytics_api.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
`
  },
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    category: 'deploy',
    language: 'yaml',
    description: 'Docker Compose orchestrating PostgreSQL database and Django API container.',
    content: `version: '3.8'

services:
  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - DJANGO_SECRET_KEY=development-secret-sports-ml-key
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=sports_analytics
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"

volumes:
  postgres_data:
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'config',
    language: 'markdown',
    description: 'Step-by-step setup guide for running the Django REST + ML project locally.',
    content: `# Sports Analytics & Supervised Machine Learning DRF API

A production-ready Django REST Framework (DRF) backend engineered for sports player telemetry tracking and supervised learning forecasting (Linear/Ridge Regression, Random Forest, Logistic Regression, Gradient Boosting).

## Quickstart

### 1. Create Virtual Environment
\`\`\`bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

### 2. Run Database Migrations
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

### 3. Create Superuser (Optional)
\`\`\`bash
python manage.py createsuperuser
\`\`\`

### 4. Start Development Server
\`\`\`bash
python manage.py runserver 8000
\`\`\`

- Swagger API Explorer: http://localhost:8000/api/docs/
- ReDoc Documentation: http://localhost:8000/api/redoc/
- Admin Panel: http://localhost:8000/admin/

## API Endpoints

### Supervised ML Training
\`\`\`bash
curl -X POST http://localhost:8000/api/v1/ml/train/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "sport": "basketball",
    "algorithm": "random_forest_regressor",
    "target_name": "points_predicted",
    "task_type": "regression",
    "feature_keys": ["minutes", "usage_rate", "true_shooting_pct", "prior_5g_avg"],
    "hyperparameters": { "n_estimators": 50, "max_depth": 5 }
  }'
\`\`\`

### Supervised ML Inference
\`\`\`bash
curl -X POST http://localhost:8000/api/v1/ml/predict/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "sport": "basketball",
    "algorithm": "random_forest_regressor",
    "target_name": "points_predicted",
    "features": {
      "minutes": 35.5,
      "usage_rate": 28.4,
      "true_shooting_pct": 59.8,
      "prior_5g_avg": 26.2
    }
  }'
\`\`\`
`
  }
];
