import { SportConfig, PlayerRecord, SportType } from '../types/sports-ml';

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    league: 'NBA / EuroLeague',
    description: 'Predict next-game scoring, game efficiency rating (PER), or clutch game impact from telemetry and usage stats.',
    features: [
      { id: 'minutes', name: 'Minutes Per Game', description: 'Average playing time on court', unit: 'min', min: 10, max: 42, defaultValue: 32, step: 0.5 },
      { id: 'usage_rate', name: 'Usage Rate %', description: 'Percentage of team plays used by player', unit: '%', min: 12, max: 38, defaultValue: 26, step: 0.5 },
      { id: 'true_shooting_pct', name: 'True Shooting %', description: 'Measure of shooting efficiency including 3PT and FT', unit: '%', min: 45, max: 70, defaultValue: 58, step: 0.5 },
      { id: 'pace', name: 'Pace (Possessions/48m)', description: 'Pace of team tempo and transition plays', unit: 'poss', min: 94, max: 108, defaultValue: 101, step: 0.5 },
      { id: 'defensive_rating', name: 'Defensive Rating', description: 'Points allowed per 100 possessions', unit: 'pts/100', min: 100, max: 122, defaultValue: 110, step: 0.5 },
      { id: 'rest_days', name: 'Rest Days', description: 'Days of rest between games (back-to-back = 0)', unit: 'days', min: 0, max: 6, defaultValue: 2, step: 1 },
      { id: 'prior_5g_avg', name: 'Prior 5-Game PTS Avg', description: 'Recent momentum rolling scoring average', unit: 'pts', min: 5, max: 36, defaultValue: 23, step: 0.5 },
      { id: 'opp_def_rank', name: 'Opponent Def Rank', description: 'Opponent team defensive ranking (1 = best, 30 = worst)', unit: 'rank', min: 1, max: 30, defaultValue: 15, step: 1 },
    ],
    targets: [
      { id: 'points_predicted', name: 'Projected Game Points', description: 'Continuous target: Next match predicted points scored', taskType: 'regression', unit: 'pts' },
      { id: 'impact_rating', name: 'Player Impact Score (PIE)', description: 'Continuous target: Overall statistical game impact rating', taskType: 'regression', unit: 'idx' },
      { id: 'clutch_win_contributor', name: 'High Impact Contributor (Win Factor > 60%)', description: 'Binary classification: Will player produce high-leverage winning performance?', taskType: 'classification', unit: 'class', classes: ['Standard', 'Dominant Winner'] },
      { id: 'fatigue_risk', name: 'High Fatigue / Minutes Load Risk', description: 'Binary classification: Risk of performance degradation due to overload', taskType: 'classification', unit: 'class', classes: ['Optimal Readiness', 'High Fatigue Risk'] }
    ]
  },
  soccer: {
    id: 'soccer',
    name: 'Football (Soccer)',
    league: 'Premier League / Champions League',
    description: 'Analyze player expected goals (xG), pressing intensity, pitch distance, and forecast match performance rating.',
    features: [
      { id: 'minutes', name: 'Minutes Played', description: 'Pitch time in match', unit: 'min', min: 30, max: 95, defaultValue: 82, step: 1 },
      { id: 'xg_per_90', name: 'Expected Goals (xG/90)', description: 'Quality of goal chances generated per 90 mins', unit: 'xG', min: 0.05, max: 1.15, defaultValue: 0.45, step: 0.05 },
      { id: 'pass_completion_pct', name: 'Pass Completion %', description: 'Percentage of successful passes', unit: '%', min: 65, max: 96, defaultValue: 84, step: 0.5 },
      { id: 'distance_covered_km', name: 'Distance Covered', description: 'Total kilometers run during match', unit: 'km', min: 8.0, max: 13.5, defaultValue: 10.8, step: 0.1 },
      { id: 'high_intensity_sprints', name: 'High-Intensity Sprints', description: 'Number of explosive sprints (>25 km/h)', unit: 'count', min: 10, max: 55, defaultValue: 28, step: 1 },
      { id: 'progressive_carries', name: 'Progressive Carries', description: 'Carries moving ball >10m towards opponent goal', unit: 'count', min: 1, max: 18, defaultValue: 7, step: 1 },
      { id: 'rest_days', name: 'Rest Days Since Last Match', description: 'Recovery window between fixtures', unit: 'days', min: 2, max: 7, defaultValue: 4, step: 1 },
      { id: 'opp_table_position', name: 'Opponent Table Rank', description: 'League standing of opponent (1 to 20)', unit: 'rank', min: 1, max: 20, defaultValue: 9, step: 1 },
    ],
    targets: [
      { id: 'match_rating', name: 'Projected Match Rating (0-10)', description: 'Continuous target: Overall statistical match performance rating', taskType: 'regression', unit: 'rating' },
      { id: 'goal_contributions', name: 'Projected Goal Involvements (Goals+Assists)', description: 'Continuous target: Expected goal involvement quantity', taskType: 'regression', unit: 'G+A' },
      { id: 'man_of_match_caliber', name: 'Man of the Match Caliber (Rating >= 8.0)', description: 'Binary classification: Match winner or top performer', taskType: 'classification', unit: 'class', classes: ['Normal Outing', 'Elite MOTM Caliber'] },
      { id: 'injury_overload_risk', name: 'Soft Tissue Strain Risk', description: 'Binary classification: Muscle strain risk from sprint & fixture density', taskType: 'classification', unit: 'class', classes: ['Low Risk', 'Elevated Strain Risk'] }
    ]
  },
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    league: 'T20 & ODI International',
    description: 'Supervised predictive model for batsman scoring runs, strike rate output, and all-round match MVP probability.',
    features: [
      { id: 'strike_rate', name: 'Career Strike Rate', description: 'Runs scored per 100 balls faced', unit: 'SR', min: 105, max: 185, defaultValue: 138, step: 1 },
      { id: 'batting_average', name: 'Batting Average', description: 'Average runs per dismissal', unit: 'avg', min: 18, max: 56, defaultValue: 34, step: 0.5 },
      { id: 'boundary_frequency_pct', name: 'Boundary % of Runs', description: 'Percentage of runs from 4s and 6s', unit: '%', min: 40, max: 80, defaultValue: 62, step: 1 },
      { id: 'powerplay_over_rate', name: 'Powerplay Overs Batted', description: 'Overs facing fielding restrictions (overs 1-6)', unit: 'ov', min: 0, max: 6, defaultValue: 3, step: 0.5 },
      { id: 'pitch_wear_index', name: 'Pitch Wear Index', description: 'Surface degradation scale (1=Flat highway, 10=Heavy spin/turn)', unit: 'idx', min: 1, max: 10, defaultValue: 4, step: 0.5 },
      { id: 'opponent_bowling_economy', name: 'Opponent Bowling Economy', description: 'Runs conceded per over by opposing bowling attack', unit: 'rpo', min: 6.2, max: 9.8, defaultValue: 7.9, step: 0.1 },
      { id: 'recent_form_3inngs', name: 'Recent 3-Innings Avg', description: 'Rolling score form', unit: 'runs', min: 8, max: 75, defaultValue: 32, step: 1 },
    ],
    targets: [
      { id: 'projected_runs', name: 'Projected Match Runs', description: 'Continuous target: Expected individual runs scored in match', taskType: 'regression', unit: 'runs' },
      { id: 'strike_rate_output', name: 'Expected Match Strike Rate', description: 'Continuous target: Pace of scoring for the match', taskType: 'regression', unit: 'SR' },
      { id: 'fifty_plus_milestone', name: 'Milestone Score (50+ Runs)', description: 'Binary classification: Likelihood of scoring half-century or century', taskType: 'classification', unit: 'class', classes: ['Under 50', '50+ Milestone'] },
    ]
  },
  baseball: {
    id: 'baseball',
    name: 'Baseball (MLB)',
    league: 'MLB Analytics',
    description: 'Predict batter on-base plus slugging (OPS), exit velocity performance, and game win probability added (WPA).',
    features: [
      { id: 'exit_velocity_mph', name: 'Avg Exit Velocity', description: 'Ball speed off the bat in MPH', unit: 'mph', min: 84, max: 96, defaultValue: 90.5, step: 0.5 },
      { id: 'hard_hit_pct', name: 'Hard Hit %', description: 'Batted balls with exit velo >= 95 mph', unit: '%', min: 25, max: 55, defaultValue: 41, step: 0.5 },
      { id: 'barrel_pct', name: 'Barrel Rate %', description: 'Optimal launch angle and exit velocity balls', unit: '%', min: 4, max: 20, defaultValue: 9.5, step: 0.5 },
      { id: 'chase_rate_pct', name: 'O-Swing / Chase %', description: 'Swings at pitches outside strike zone', unit: '%', min: 18, max: 40, defaultValue: 28, step: 0.5 },
      { id: 'opp_pitcher_era', name: 'Opposing Pitcher ERA', description: 'Earned Run Average of opposing starting pitcher', unit: 'era', min: 2.1, max: 5.6, defaultValue: 3.75, step: 0.05 },
      { id: 'ballpark_factor', name: 'Ballpark Hitter Index', description: 'Park factor (100 = neutral, >100 = hitter friendly)', unit: 'idx', min: 88, max: 114, defaultValue: 102, step: 1 },
    ],
    targets: [
      { id: 'expected_ops', name: 'Projected OPS', description: 'On-Base Percentage + Slugging Percentage for match', taskType: 'regression', unit: 'OPS' },
      { id: 'multi_hit_game', name: 'Multi-Hit Game Likelihood', description: 'Binary classification: 2 or more base hits in contest', taskType: 'classification', unit: 'class', classes: ['Single/No Hit', 'Multi-Hit (2+)'] }
    ]
  }
};

// Seed dataset generator for realistic player statistics across all sports
function generateRealisticPlayers(sport: SportType, count: number = 32): PlayerRecord[] {
  const cfg = SPORT_CONFIGS[sport];
  const records: PlayerRecord[] = [];

  const nbaNames = [
    { name: 'Luka Dončić', team: 'Dallas Mavericks', pos: 'PG/SG', tier: 1.25 },
    { name: 'Nikola Jokić', team: 'Denver Nuggets', pos: 'C', tier: 1.28 },
    { name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', pos: 'PF', tier: 1.22 },
    { name: 'Shai Gilgeous-Alexander', team: 'OKC Thunder', pos: 'PG', tier: 1.20 },
    { name: 'Jayson Tatum', team: 'Boston Celtics', pos: 'SF/PF', tier: 1.15 },
    { name: 'Stephen Curry', team: 'Golden State Warriors', pos: 'PG', tier: 1.18 },
    { name: 'Kevin Durant', team: 'Phoenix Suns', pos: 'SF', tier: 1.16 },
    { name: 'Anthony Edwards', team: 'Minnesota Timberwolves', pos: 'SG', tier: 1.12 },
    { name: 'Jalen Brunson', team: 'New York Knicks', pos: 'PG', tier: 1.14 },
    { name: 'Devin Booker', team: 'Phoenix Suns', pos: 'SG', tier: 1.10 },
    { name: 'Tyrese Haliburton', team: 'Indiana Pacers', pos: 'PG', tier: 1.08 },
    { name: 'Anthony Davis', team: 'LA Lakers', pos: 'C/PF', tier: 1.15 },
    { name: 'LeBron James', team: 'LA Lakers', pos: 'SF/PF', tier: 1.14 },
    { name: 'Donovan Mitchell', team: 'Cleveland Cavaliers', pos: 'SG', tier: 1.12 },
    { name: 'Victor Wembanyama', team: 'San Antonio Spurs', pos: 'C', tier: 1.13 },
    { name: 'Damian Lillard', team: 'Milwaukee Bucks', pos: 'PG', tier: 1.05 },
    { name: 'Domantas Sabonis', team: 'Sacramento Kings', pos: 'C/PF', tier: 1.06 },
    { name: 'De\'Aaron Fox', team: 'Sacramento Kings', pos: 'PG', tier: 1.05 },
    { name: 'Bam Adebayo', team: 'Miami Heat', pos: 'C', tier: 1.02 },
    { name: 'Jimmy Butler', team: 'Miami Heat', pos: 'SF', tier: 1.04 },
    { name: 'Jaylen Brown', team: 'Boston Celtics', pos: 'SG/SF', tier: 1.06 },
    { name: 'Trae Young', team: 'Atlanta Hawks', pos: 'PG', tier: 1.03 },
    { name: 'Zion Williamson', team: 'New Orleans Pelicans', pos: 'PF', tier: 1.06 },
    { name: 'Paolo Banchero', team: 'Orlando Magic', pos: 'PF', tier: 1.02 },
    { name: 'Chet Holmgren', team: 'OKC Thunder', pos: 'C/PF', tier: 1.00 },
    { name: 'Mikal Bridges', team: 'New York Knicks', pos: 'SF', tier: 0.94 },
    { name: 'Fred VanVleet', team: 'Houston Rockets', pos: 'PG', tier: 0.92 },
    { name: 'Alperen Şengün', team: 'Houston Rockets', pos: 'C', tier: 0.98 },
    { name: 'Darius Garland', team: 'Cleveland Cavaliers', pos: 'PG', tier: 0.94 },
    { name: 'Franz Wagner', team: 'Orlando Magic', pos: 'SF', tier: 0.95 },
    { name: 'Jaren Jackson Jr.', team: 'Memphis Grizzlies', pos: 'PF/C', tier: 0.96 },
    { name: 'Derrick White', team: 'Boston Celtics', pos: 'PG/SG', tier: 0.92 },
  ];

  const soccerNames = [
    { name: 'Erling Haaland', team: 'Manchester City', pos: 'ST', tier: 1.30 },
    { name: 'Kylian Mbappé', team: 'Real Madrid', pos: 'LW/ST', tier: 1.28 },
    { name: 'Vinícius Júnior', team: 'Real Madrid', pos: 'LW', tier: 1.24 },
    { name: 'Mohamed Salah', team: 'Liverpool', pos: 'RW', tier: 1.22 },
    { name: 'Bukayo Saka', team: 'Arsenal', pos: 'RW', tier: 1.18 },
    { name: 'Cole Palmer', team: 'Chelsea', pos: 'AM/RW', tier: 1.17 },
    { name: 'Harry Kane', team: 'Bayern Munich', pos: 'ST', tier: 1.22 },
    { name: 'Jude Bellingham', team: 'Real Madrid', pos: 'AM/CM', tier: 1.20 },
    { name: 'Rodri', team: 'Manchester City', pos: 'DM', tier: 1.19 },
    { name: 'Kevin De Bruyne', team: 'Manchester City', pos: 'AM', tier: 1.16 },
    { name: 'Florian Wirtz', team: 'Bayer Leverkusen', pos: 'AM', tier: 1.15 },
    { name: 'Jamal Musiala', team: 'Bayern Munich', pos: 'AM/LW', tier: 1.14 },
    { name: 'Phil Foden', team: 'Manchester City', pos: 'RW/AM', tier: 1.12 },
    { name: 'Martin Ødegaard', team: 'Arsenal', pos: 'AM', tier: 1.10 },
    { name: 'Declan Rice', team: 'Arsenal', pos: 'DM/CM', tier: 1.08 },
    { name: 'Lautaro Martínez', team: 'Inter Milan', pos: 'ST', tier: 1.11 },
    { name: 'Son Heung-min', team: 'Tottenham', pos: 'LW/ST', tier: 1.08 },
    { name: 'Bruno Fernandes', team: 'Manchester United', pos: 'AM', tier: 1.07 },
    { name: 'Ollie Watkins', team: 'Aston Villa', pos: 'ST', tier: 1.05 },
    { name: 'Alexander Isak', team: 'Newcastle', pos: 'ST', tier: 1.08 },
    { name: 'William Saliba', team: 'Arsenal', pos: 'CB', tier: 1.05 },
    { name: 'Federico Valverde', team: 'Real Madrid', pos: 'CM', tier: 1.09 },
    { name: 'Lamine Yamal', team: 'Barcelona', pos: 'RW', tier: 1.14 },
    { name: 'Robert Lewandowski', team: 'Barcelona', pos: 'ST', tier: 1.12 },
    { name: 'Pedri', team: 'Barcelona', pos: 'CM', tier: 1.07 },
    { name: 'Alexis Mac Allister', team: 'Liverpool', pos: 'CM', tier: 1.04 },
    { name: 'Dominik Szoboszlai', team: 'Liverpool', pos: 'CM', tier: 1.01 },
    { name: 'Bernardo Silva', team: 'Manchester City', pos: 'RW/CM', tier: 1.06 },
    { name: 'Rafael Leão', team: 'AC Milan', pos: 'LW', tier: 1.03 },
    { name: 'Antoine Griezmann', team: 'Atlético Madrid', pos: 'SS/AM', tier: 1.08 },
    { name: 'Kaoru Mitoma', team: 'Brighton', pos: 'LW', tier: 0.98 },
    { name: 'Bruno Guimarães', team: 'Newcastle', pos: 'CM', tier: 1.02 },
  ];

  const cricketNames = [
    { name: 'Virat Kohli', team: 'India', pos: 'Top Order', tier: 1.25 },
    { name: 'Rohit Sharma', team: 'India', pos: 'Opener', tier: 1.20 },
    { name: 'Babar Azam', team: 'Pakistan', pos: 'Top Order', tier: 1.18 },
    { name: 'Travis Head', team: 'Australia', pos: 'Opener', tier: 1.22 },
    { name: 'Suryakumar Yadav', team: 'India', pos: 'Middle Order', tier: 1.24 },
    { name: 'Jos Buttler', team: 'England', pos: 'Wicket-Keeper/Opener', tier: 1.16 },
    { name: 'Heinrich Klaasen', team: 'South Africa', pos: 'Middle Order', tier: 1.21 },
    { name: 'Glenn Maxwell', team: 'Australia', pos: 'All-Rounder', tier: 1.14 },
    { name: 'David Warner', team: 'Australia', pos: 'Opener', tier: 1.12 },
    { name: 'Rishabh Pant', team: 'India', pos: 'Wicket-Keeper', tier: 1.10 },
    { name: 'Kane Williamson', team: 'New Zealand', pos: 'Top Order', tier: 1.11 },
    { name: 'Phil Salt', team: 'England', pos: 'Opener', tier: 1.15 },
    { name: 'Nicholas Pooran', team: 'West Indies', pos: 'Wicket-Keeper', tier: 1.13 },
    { name: 'Hardik Pandya', team: 'India', pos: 'All-Rounder', tier: 1.09 },
    { name: 'Mitchell Marsh', team: 'Australia', pos: 'All-Rounder', tier: 1.08 },
    { name: 'Mohammad Rizwan', team: 'Pakistan', pos: 'Wicket-Keeper', tier: 1.07 },
    { name: 'Quinton de Kock', team: 'South Africa', pos: 'Opener', tier: 1.06 },
    { name: 'Aiden Markram', team: 'South Africa', pos: 'Top Order', tier: 1.04 },
    { name: 'Shubman Gill', team: 'India', pos: 'Opener', tier: 1.12 },
    { name: 'Yashasvi Jaiswal', team: 'India', pos: 'Opener', tier: 1.15 },
    { name: 'Jonny Bairstow', team: 'England', pos: 'Top Order', tier: 1.02 },
    { name: 'Glenn Phillips', team: 'New Zealand', pos: 'Middle Order', tier: 1.03 },
    { name: 'Rachin Ravindra', team: 'New Zealand', pos: 'All-Rounder', tier: 1.05 },
    { name: 'Marcus Stoinis', team: 'Australia', pos: 'All-Rounder', tier: 1.01 },
    { name: 'Harry Brook', team: 'England', pos: 'Middle Order', tier: 1.07 },
    { name: 'Shimron Hetmyer', team: 'West Indies', pos: 'Middle Order', tier: 0.98 },
    { name: 'Daryl Mitchell', team: 'New Zealand', pos: 'Middle Order', tier: 1.02 },
    { name: 'Andre Russell', team: 'West Indies', pos: 'All-Rounder', tier: 1.09 },
    { name: 'Liam Livingstone', team: 'England', pos: 'All-Rounder', tier: 0.99 },
    { name: 'Devon Conway', team: 'New Zealand', pos: 'Opener', tier: 1.00 },
    { name: 'Tim David', team: 'Australia', pos: 'Finisher', tier: 1.02 },
    { name: 'Axar Patel', team: 'India', pos: 'All-Rounder', tier: 0.97 },
  ];

  const baseballNames = [
    { name: 'Shohei Ohtani', team: 'LA Dodgers', pos: 'DH/P', tier: 1.30 },
    { name: 'Aaron Judge', team: 'NY Yankees', pos: 'CF/RF', tier: 1.28 },
    { name: 'Juan Soto', team: 'NY Yankees', pos: 'RF', tier: 1.24 },
    { name: 'Bobby Witt Jr.', team: 'KC Royals', pos: 'SS', tier: 1.21 },
    { name: 'Gunnar Henderson', team: 'Baltimore Orioles', pos: 'SS', tier: 1.18 },
    { name: 'Mookie Betts', team: 'LA Dodgers', pos: 'SS/RF', tier: 1.19 },
    { name: 'Bryce Harper', team: 'Philadelphia Phillies', pos: '1B', tier: 1.16 },
    { name: 'Freddie Freeman', team: 'LA Dodgers', pos: '1B', tier: 1.14 },
    { name: 'Yordan Alvarez', team: 'Houston Astros', pos: 'DH/LF', tier: 1.17 },
    { name: 'José Ramírez', team: 'Cleveland Guardians', pos: '3B', tier: 1.15 },
    { name: 'Kyle Tucker', team: 'Houston Astros', pos: 'RF', tier: 1.13 },
    { name: 'Corey Seager', team: 'Texas Rangers', pos: 'SS', tier: 1.12 },
    { name: 'Marcell Ozuna', team: 'Atlanta Braves', pos: 'DH', tier: 1.10 },
    { name: 'Rafael Devers', team: 'Boston Red Sox', pos: '3B', tier: 1.09 },
    { name: 'Vladimir Guerrero Jr.', team: 'Toronto Blue Jays', pos: '1B', tier: 1.08 },
    { name: 'Fernando Tatis Jr.', team: 'San Diego Padres', pos: 'RF', tier: 1.11 },
    { name: 'Elly De La Cruz', team: 'Cincinnati Reds', pos: 'SS', tier: 1.07 },
    { name: 'Adley Rutschman', team: 'Baltimore Orioles', pos: 'C', tier: 1.06 },
    { name: 'Pete Alonso', team: 'NY Mets', pos: '1B', tier: 1.05 },
    { name: 'Austin Riley', team: 'Atlanta Braves', pos: '3B', tier: 1.04 },
    { name: 'Ketel Marte', team: 'Arizona Diamondbacks', pos: '2B', tier: 1.07 },
    { name: 'Corbin Carroll', team: 'Arizona Diamondbacks', pos: 'OF', tier: 1.03 },
    { name: 'Trea Turner', team: 'Philadelphia Phillies', pos: 'SS', tier: 1.04 },
    { name: 'Julio Rodríguez', team: 'Seattle Mariners', pos: 'CF', tier: 1.05 },
    { name: 'Manny Machado', team: 'San Diego Padres', pos: '3B', tier: 1.03 },
    { name: 'Christian Walker', team: 'Arizona Diamondbacks', pos: '1B', tier: 0.99 },
    { name: 'Marcus Semien', team: 'Texas Rangers', pos: '2B', tier: 0.98 },
    { name: 'Matt Chapman', team: 'SF Giants', pos: '3B', tier: 0.97 },
    { name: 'Cody Bellinger', team: 'Chicago Cubs', pos: 'OF/1B', tier: 0.98 },
    { name: 'Bo Bichette', team: 'Toronto Blue Jays', pos: 'SS', tier: 0.96 },
    { name: 'Luis Arraez', team: 'San Diego Padres', pos: '2B/1B', tier: 1.01 },
    { name: 'Jurickson Profar', team: 'San Diego Padres', pos: 'LF', tier: 0.99 },
  ];

  const pool = sport === 'basketball' ? nbaNames :
               sport === 'soccer' ? soccerNames :
               sport === 'cricket' ? cricketNames : baseballNames;

  pool.slice(0, count).forEach((item, index) => {
    const age = 21 + (index % 15);
    const tier = item.tier;

    const features: Record<string, number> = {};
    const targets: Record<string, number> = {};

    if (sport === 'basketball') {
      const minutes = +(22 + (tier - 0.9) * 16 + ((index * 3) % 5)).toFixed(1);
      const usage = +(18 + (tier - 0.9) * 18 + ((index * 7) % 4) - 2).toFixed(1);
      const ts = +(51 + (tier - 0.9) * 14 + ((index * 2) % 5)).toFixed(1);
      const pace = +(97 + ((index * 5) % 9)).toFixed(1);
      const def_rating = +(116 - (tier - 0.9) * 7 + (index % 4)).toFixed(1);
      const rest_days = index % 4; // 0, 1, 2, 3
      const prior_5g = +(14 + (tier - 0.9) * 16 + ((index * 11) % 6)).toFixed(1);
      const opp_def_rank = 1 + (index * 7) % 30;

      features['minutes'] = minutes;
      features['usage_rate'] = usage;
      features['true_shooting_pct'] = ts;
      features['pace'] = pace;
      features['defensive_rating'] = def_rating;
      features['rest_days'] = rest_days;
      features['prior_5g_avg'] = prior_5g;
      features['opp_def_rank'] = opp_def_rank;

      // Realistic continuous targets derived from mathematical physics/stats
      const restFactor = rest_days === 0 ? -1.8 : rest_days === 1 ? 0 : 0.9;
      const oppFactor = (opp_def_rank - 15) * 0.22;
      const predictedPts = +(
        (minutes * 0.42) +
        (usage * 0.38) +
        ((ts - 50) * 0.24) +
        (prior_5g * 0.32) +
        restFactor +
        oppFactor +
        ((index % 3) - 1) * 1.2
      ).toFixed(1);

      const impactScore = +(
        10.5 + (predictedPts * 0.35) + ((ts - 50) * 0.25) - ((def_rating - 110) * 0.3)
      ).toFixed(1);

      targets['points_predicted'] = Math.max(8, predictedPts);
      targets['impact_rating'] = Math.max(5, impactScore);
      targets['clutch_win_contributor'] = (predictedPts >= 24 && ts >= 57) ? 1 : 0;
      targets['fatigue_risk'] = (minutes >= 35 && rest_days === 0) ? 1 : 0;

    } else if (sport === 'soccer') {
      const minutes = +(60 + (tier - 0.9) * 28 + (index % 8)).toFixed(0);
      const xg = +(0.15 + (tier - 0.9) * 0.75 + ((index * 3) % 4) * 0.05).toFixed(2);
      const pass_pct = +(75 + (tier - 0.9) * 14 + (index % 5)).toFixed(1);
      const dist_km = +(9.2 + ((index * 7) % 35) / 10).toFixed(1);
      const sprints = Math.round(18 + (tier - 0.9) * 24 + (index % 9));
      const carries = Math.round(3 + (tier - 0.9) * 9 + (index % 5));
      const rest_days = 2 + (index % 5);
      const opp_table = 1 + (index * 3) % 20;

      features['minutes'] = +minutes;
      features['xg_per_90'] = xg;
      features['pass_completion_pct'] = pass_pct;
      features['distance_covered_km'] = dist_km;
      features['high_intensity_sprints'] = sprints;
      features['progressive_carries'] = carries;
      features['rest_days'] = rest_days;
      features['opp_table_position'] = opp_table;

      const oppFactor = (opp_table - 10) * 0.04;
      const rating = +(
        6.2 + (xg * 1.2) + ((pass_pct - 80) * 0.04) + (carries * 0.08) + oppFactor
      ).toFixed(2);

      const ga = +(
        (xg * (minutes / 90) * 1.05) + (carries * 0.04)
      ).toFixed(2);

      targets['match_rating'] = Math.min(9.8, Math.max(5.5, rating));
      targets['goal_contributions'] = ga;
      targets['man_of_match_caliber'] = rating >= 7.8 ? 1 : 0;
      targets['injury_overload_risk'] = (sprints > 35 && rest_days <= 3) ? 1 : 0;

    } else if (sport === 'cricket') {
      const sr = Math.round(118 + (tier - 0.9) * 45 + (index % 12));
      const avg = +(24 + (tier - 0.9) * 25 + (index % 8)).toFixed(1);
      const boundary_pct = Math.round(48 + (tier - 0.9) * 22 + (index % 10));
      const pp_overs = +(1.5 + (index % 5)).toFixed(1);
      const pitch_wear = +(2.5 + (index % 7)).toFixed(1);
      const opp_econ = +(6.8 + (index % 6) * 0.4).toFixed(1);
      const form = Math.round(18 + (tier - 0.9) * 35 + (index % 14));

      features['strike_rate'] = sr;
      features['batting_average'] = avg;
      features['boundary_frequency_pct'] = boundary_pct;
      features['powerplay_over_rate'] = pp_overs;
      features['pitch_wear_index'] = pitch_wear;
      features['opponent_bowling_economy'] = opp_econ;
      features['recent_form_3inngs'] = form;

      const projectedRuns = +(
        (avg * 0.45) + (form * 0.35) + (pp_overs * 3.2) - (pitch_wear * 1.5) + (opp_econ * 1.8)
      ).toFixed(1);

      const matchSR = +(
        (sr * 0.7) + (boundary_pct * 0.5) - (pitch_wear * 3.5)
      ).toFixed(1);

      targets['projected_runs'] = Math.max(10, projectedRuns);
      targets['strike_rate_output'] = matchSR;
      targets['fifty_plus_milestone'] = projectedRuns >= 48 ? 1 : 0;

    } else {
      // Baseball
      const ev = +(86 + (tier - 0.9) * 8 + (index % 5) * 0.4).toFixed(1);
      const hard_hit = +(30 + (tier - 0.9) * 20 + (index % 6)).toFixed(1);
      const barrel = +(5 + (tier - 0.9) * 12 + (index % 5)).toFixed(1);
      const chase = +(24 - (tier - 0.9) * 8 + (index % 7)).toFixed(1);
      const opp_era = +(2.8 + (index % 6) * 0.4).toFixed(2);
      const park = Math.round(94 + (index % 18));

      features['exit_velocity_mph'] = ev;
      features['hard_hit_pct'] = hard_hit;
      features['barrel_pct'] = barrel;
      features['chase_rate_pct'] = chase;
      features['opp_pitcher_era'] = opp_era;
      features['ballpark_factor'] = park;

      const ops = +(
        0.620 + ((ev - 88) * 0.025) + ((barrel - 6) * 0.018) + ((opp_era - 3.5) * 0.04) + ((park - 100) * 0.003)
      ).toFixed(3);

      targets['expected_ops'] = Math.min(1.200, Math.max(0.580, ops));
      targets['multi_hit_game'] = ops >= 0.880 ? 1 : 0;
    }

    records.push({
      id: `pl-${sport}-${index + 1}`,
      name: item.name,
      team: item.team,
      position: item.pos,
      age,
      sport,
      features,
      targets
    });
  });

  return records;
}

export const INITIAL_DATASETS: Record<SportType, PlayerRecord[]> = {
  basketball: generateRealisticPlayers('basketball', 32),
  soccer: generateRealisticPlayers('soccer', 32),
  cricket: generateRealisticPlayers('cricket', 32),
  baseball: generateRealisticPlayers('baseball', 32)
};
