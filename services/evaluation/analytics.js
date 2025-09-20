/**
 * 高级数据分析服务
 * 提供统计学方法和预测算法用于教师评价分析
 */

const { jStat } = require('jstat');

class AdvancedAnalyticsService {
  constructor() {
    this.models = new Map();
    this.cache = new Map();
    this.statistics = new Map();
  }

  /**
   * 计算教师绩效的综合统计分析
   * @param {Array} evaluationData - 评价数据数组
   * @param {Object} options - 分析选项
   * @returns {Object} 统计分析结果
   */
  calculatePerformanceStatistics(evaluationData, options = {}) {
    const {
      timeFrame = '12months',
      compareWith = 'department',
      confidenceLevel = 0.95,
      includeSeasonality = true
    } = options;

    if (!evaluationData || evaluationData.length === 0) {
      throw new Error('No evaluation data provided');
    }

    // 基础统计指标
    const basicStats = this.computeBasicStatistics(evaluationData);

    // 趋势分析
    const trendAnalysis = this.analyzeTrends(evaluationData, { timeFrame, includeSeasonality });

    // 同行比较
    const peerComparison = this.calculatePeerComparison(evaluationData, compareWith);

    // 预测模型
    const predictions = this.generatePredictions(evaluationData, {
      forecastPeriods: 6,
      confidenceLevel
    });

    // 异常检测
    const anomalies = this.detectAnomalies(evaluationData, {
      method: 'isolation_forest',
      threshold: 0.1
    });

    // 相关性分析
    const correlations = this.analyzeCorrelations(evaluationData);

    return {
      basic_statistics: basicStats,
      trend_analysis: trendAnalysis,
      peer_comparison: peerComparison,
      predictions: predictions,
      anomaly_detection: anomalies,
      correlations: correlations,
      analysis_metadata: {
        data_points: evaluationData.length,
        time_range: this.getTimeRange(evaluationData),
        confidence_level: confidenceLevel,
        analysis_date: new Date().toISOString(),
        algorithm_version: '2.1'
      }
    };
  }

  /**
   * 计算基础统计指标
   */
  computeBasicStatistics(data) {
    const scores = data.map(d => parseFloat(d.overall_rating));

    // 中心趋势
    const mean = jStat.mean(scores);
    const median = jStat.median(scores);
    const mode = jStat.mode(scores);

    // 离散程度
    const variance = jStat.variance(scores, true); // 样本方差
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    // 分布形状
    const skewness = this.calculateSkewness(scores);
    const kurtosis = this.calculateKurtosis(scores);

    // 分位数
    const quartiles = {
      q1: jStat.percentile(scores, 0.25),
      q2: median,
      q3: jStat.percentile(scores, 0.75)
    };

    const iqr = quartiles.q3 - quartiles.q1;

    // 极值
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min;

    // 置信区间
    const confidenceInterval = this.calculateConfidenceInterval(scores, 0.95);

    return {
      central_tendency: {
        mean: parseFloat(mean.toFixed(3)),
        median: parseFloat(median.toFixed(3)),
        mode: mode
      },
      dispersion: {
        variance: parseFloat(variance.toFixed(3)),
        standard_deviation: parseFloat(standardDeviation.toFixed(3)),
        coefficient_of_variation: parseFloat(coefficientOfVariation.toFixed(3)),
        interquartile_range: parseFloat(iqr.toFixed(3)),
        range: parseFloat(range.toFixed(3))
      },
      distribution_shape: {
        skewness: parseFloat(skewness.toFixed(3)),
        kurtosis: parseFloat(kurtosis.toFixed(3)),
        interpretation: this.interpretDistribution(skewness, kurtosis)
      },
      quartiles: {
        q1: parseFloat(quartiles.q1.toFixed(3)),
        q2: parseFloat(quartiles.q2.toFixed(3)),
        q3: parseFloat(quartiles.q3.toFixed(3))
      },
      extremes: {
        minimum: parseFloat(min.toFixed(3)),
        maximum: parseFloat(max.toFixed(3)),
        outliers: this.detectOutliers(scores, quartiles, iqr)
      },
      confidence_interval: {
        level: 0.95,
        lower_bound: parseFloat(confidenceInterval.lower.toFixed(3)),
        upper_bound: parseFloat(confidenceInterval.upper.toFixed(3)),
        margin_of_error: parseFloat(((confidenceInterval.upper - confidenceInterval.lower) / 2).toFixed(3))
      }
    };
  }

  /**
   * 趋势分析
   */
  analyzeTrends(data, options) {
    const { timeFrame, includeSeasonality } = options;

    // 按时间排序数据
    const sortedData = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // 时间序列分析
    const timeSeries = this.createTimeSeries(sortedData);

    // 线性趋势
    const linearTrend = this.calculateLinearTrend(timeSeries);

    // 移动平均
    const movingAverages = this.calculateMovingAverages(timeSeries, [3, 6, 12]);

    // 季节性分析
    let seasonality = null;
    if (includeSeasonality && timeSeries.length >= 12) {
      seasonality = this.analyzeSeasonality(timeSeries);
    }

    // 趋势分解
    const decomposition = this.decomposeTimeSeries(timeSeries);

    // 变化率分析
    const changeRates = this.calculateChangeRates(timeSeries);

    return {
      linear_trend: linearTrend,
      moving_averages: movingAverages,
      seasonality: seasonality,
      decomposition: decomposition,
      change_rates: changeRates,
      trend_summary: this.summarizeTrend(linearTrend, changeRates)
    };
  }

  /**
   * 同行比较分析
   */
  calculatePeerComparison(teacherData, compareWith = 'department') {
    // 模拟同行数据（实际应用中从数据库获取）
    const peerData = this.generatePeerData(compareWith);

    const teacherScores = teacherData.map(d => parseFloat(d.overall_rating));
    const peerScores = peerData.map(d => parseFloat(d.overall_rating));

    const teacherMean = jStat.mean(teacherScores);
    const peerMean = jStat.mean(peerScores);

    // 统计显著性检验
    const tTest = this.performTTest(teacherScores, peerScores);

    // 效应大小 (Cohen's d)
    const effectSize = this.calculateCohenD(teacherScores, peerScores);

    // 百分位数排名
    const percentileRank = this.calculatePercentileRank(teacherMean, peerScores);

    // Z分数
    const zScore = (teacherMean - peerMean) / jStat.stdev(peerScores, true);

    return {
      comparison_group: compareWith,
      teacher_performance: {
        mean_score: parseFloat(teacherMean.toFixed(3)),
        sample_size: teacherScores.length
      },
      peer_performance: {
        mean_score: parseFloat(peerMean.toFixed(3)),
        sample_size: peerScores.length,
        standard_deviation: parseFloat(jStat.stdev(peerScores, true).toFixed(3))
      },
      statistical_comparison: {
        difference: parseFloat((teacherMean - peerMean).toFixed(3)),
        t_test: tTest,
        effect_size: {
          cohens_d: parseFloat(effectSize.toFixed(3)),
          interpretation: this.interpretEffectSize(effectSize)
        },
        z_score: parseFloat(zScore.toFixed(3))
      },
      ranking: {
        percentile_rank: parseFloat(percentileRank.toFixed(1)),
        performance_level: this.categorizePerformance(percentileRank),
        rank_interpretation: this.interpretPercentileRank(percentileRank)
      }
    };
  }

  /**
   * 预测分析
   */
  generatePredictions(data, options) {
    const { forecastPeriods, confidenceLevel } = options;

    // 准备时间序列数据
    const timeSeries = this.createTimeSeries(data);

    if (timeSeries.length < 3) {
      return {
        error: 'Insufficient data for prediction',
        minimum_required: 3,
        available: timeSeries.length
      };
    }

    // 多种预测模型
    const predictions = {};

    // 1. 线性回归预测
    predictions.linear_regression = this.predictLinearRegression(timeSeries, forecastPeriods);

    // 2. 指数平滑预测
    predictions.exponential_smoothing = this.predictExponentialSmoothing(timeSeries, forecastPeriods);

    // 3. ARIMA模拟（简化版）
    predictions.arima_simplified = this.predictARIMA(timeSeries, forecastPeriods);

    // 4. 集成预测（多模型平均）
    predictions.ensemble = this.createEnsemblePrediction(predictions, confidenceLevel);

    // 模型评估
    const modelEvaluation = this.evaluatePredictionModels(timeSeries, predictions);

    return {
      predictions: predictions,
      model_evaluation: modelEvaluation,
      forecast_metadata: {
        forecast_periods: forecastPeriods,
        confidence_level: confidenceLevel,
        base_period: this.getTimeRange(data),
        model_count: Object.keys(predictions).length - 1 // 排除ensemble
      }
    };
  }

  /**
   * 异常检测
   */
  detectAnomalies(data, options) {
    const { method, threshold } = options;
    const scores = data.map(d => parseFloat(d.overall_rating));

    let anomalies = [];

    switch (method) {
      case 'statistical':
        anomalies = this.detectStatisticalAnomalies(scores, threshold);
        break;
      case 'isolation_forest':
        anomalies = this.detectIsolationForestAnomalies(scores, threshold);
        break;
      case 'z_score':
        anomalies = this.detectZScoreAnomalies(scores, threshold);
        break;
      default:
        // 组合多种方法
        anomalies = this.detectCombinedAnomalies(scores, threshold);
    }

    return {
      method: method,
      threshold: threshold,
      anomalies_found: anomalies.length,
      anomaly_rate: parseFloat((anomalies.length / scores.length * 100).toFixed(2)),
      anomalies: anomalies.map(anomaly => ({
        ...anomaly,
        severity: this.classifyAnomalySeverity(anomaly.score),
        explanation: this.explainAnomaly(anomaly, scores)
      })),
      summary: this.summarizeAnomalies(anomalies, scores)
    };
  }

  /**
   * 相关性分析
   */
  analyzeCorrelations(data) {
    // 提取数值型变量
    const variables = this.extractNumericalVariables(data);

    if (variables.length < 2) {
      return {
        error: 'Insufficient variables for correlation analysis',
        available_variables: variables.map(v => v.name)
      };
    }

    // 计算相关矩阵
    const correlationMatrix = this.calculateCorrelationMatrix(variables);

    // 显著性检验
    const significanceTests = this.testCorrelationSignificance(variables);

    // 相关性解释
    const interpretations = this.interpretCorrelations(correlationMatrix);

    return {
      correlation_matrix: correlationMatrix,
      significance_tests: significanceTests,
      interpretations: interpretations,
      strongest_correlations: this.findStrongestCorrelations(correlationMatrix),
      correlation_summary: this.summarizeCorrelations(correlationMatrix)
    };
  }

  // ============ 辅助方法 ============

  calculateSkewness(data) {
    const n = data.length;
    const mean = jStat.mean(data);
    const std = jStat.stdev(data, true);

    const skewness = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / std, 3);
    }, 0) / n;

    return skewness;
  }

  calculateKurtosis(data) {
    const n = data.length;
    const mean = jStat.mean(data);
    const std = jStat.stdev(data, true);

    const kurtosis = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / std, 4);
    }, 0) / n - 3; // 减3得到超值峰度

    return kurtosis;
  }

  interpretDistribution(skewness, kurtosis) {
    let interpretation = [];

    // 偏度解释
    if (Math.abs(skewness) < 0.5) {
      interpretation.push('Distribution is approximately symmetric');
    } else if (skewness > 0.5) {
      interpretation.push('Distribution is positively skewed (right tail)');
    } else {
      interpretation.push('Distribution is negatively skewed (left tail)');
    }

    // 峰度解释
    if (Math.abs(kurtosis) < 0.5) {
      interpretation.push('Distribution has normal tail behavior');
    } else if (kurtosis > 0.5) {
      interpretation.push('Distribution has heavy tails (leptokurtic)');
    } else {
      interpretation.push('Distribution has light tails (platykurtic)');
    }

    return interpretation;
  }

  calculateConfidenceInterval(data, level) {
    const mean = jStat.mean(data);
    const std = jStat.stdev(data, true);
    const n = data.length;
    const alpha = 1 - level;

    // t分布临界值
    const tCritical = jStat.studentt.inv(1 - alpha / 2, n - 1);
    const marginOfError = tCritical * (std / Math.sqrt(n));

    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError
    };
  }

  detectOutliers(data, quartiles, iqr) {
    const lowerFence = quartiles.q1 - 1.5 * iqr;
    const upperFence = quartiles.q3 + 1.5 * iqr;

    return data
      .map((value, index) => ({ value, index }))
      .filter(item => item.value < lowerFence || item.value > upperFence)
      .map(item => ({
        value: item.value,
        index: item.index,
        type: item.value < lowerFence ? 'lower_outlier' : 'upper_outlier',
        severity: this.calculateOutlierSeverity(item.value, lowerFence, upperFence, iqr)
      }));
  }

  calculateOutlierSeverity(value, lowerFence, upperFence, iqr) {
    const extremeLowerFence = lowerFence - 1.5 * iqr;
    const extremeUpperFence = upperFence + 1.5 * iqr;

    if (value < extremeLowerFence || value > extremeUpperFence) {
      return 'extreme';
    } else {
      return 'mild';
    }
  }

  createTimeSeries(data) {
    return data.map(d => ({
      date: new Date(d.created_at),
      value: parseFloat(d.overall_rating),
      period: this.getPeriodFromDate(new Date(d.created_at))
    }));
  }

  getPeriodFromDate(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
  }

  calculateLinearTrend(timeSeries) {
    const n = timeSeries.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = timeSeries.map(ts => ts.value);

    // 最小二乘法计算斜率和截距
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 计算R²
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    return {
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(4)),
      r_squared: parseFloat(rSquared.toFixed(4)),
      trend_direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      strength: this.interpretTrendStrength(Math.abs(slope), rSquared)
    };
  }

  interpretTrendStrength(slope, rSquared) {
    if (rSquared < 0.25) return 'weak';
    if (rSquared < 0.5) return 'moderate';
    if (rSquared < 0.75) return 'strong';
    return 'very_strong';
  }

  calculateMovingAverages(timeSeries, windows) {
    const result = {};

    windows.forEach(window => {
      if (timeSeries.length >= window) {
        const ma = [];
        for (let i = window - 1; i < timeSeries.length; i++) {
          const subset = timeSeries.slice(i - window + 1, i + 1);
          const average = subset.reduce((sum, ts) => sum + ts.value, 0) / window;
          ma.push({
            period: timeSeries[i].period,
            value: parseFloat(average.toFixed(3))
          });
        }
        result[`ma_${window}`] = ma;
      }
    });

    return result;
  }

  generatePeerData(compareWith) {
    // 模拟同行数据生成
    const sampleSize = 20 + Math.floor(Math.random() * 30);
    const peerData = [];

    for (let i = 0; i < sampleSize; i++) {
      // 正态分布随机数生成
      const score = this.generateNormalRandom(3.8, 0.6);
      peerData.push({
        overall_rating: Math.max(1, Math.min(5, score)),
        teacher_id: `peer_${i + 1}`,
        comparison_group: compareWith
      });
    }

    return peerData;
  }

  generateNormalRandom(mean, stdDev) {
    // Box-Muller变换生成正态分布随机数
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }

  performTTest(sample1, sample2) {
    const n1 = sample1.length;
    const n2 = sample2.length;
    const mean1 = jStat.mean(sample1);
    const mean2 = jStat.mean(sample2);
    const var1 = jStat.variance(sample1, true);
    const var2 = jStat.variance(sample2, true);

    // Welch's t-test (不等方差)
    const pooledVar = var1 / n1 + var2 / n2;
    const tStatistic = (mean1 - mean2) / Math.sqrt(pooledVar);

    // 自由度计算 (Welch-Satterthwaite方程)
    const df = Math.pow(pooledVar, 2) / (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));

    // p值计算
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), df));

    return {
      t_statistic: parseFloat(tStatistic.toFixed(4)),
      degrees_of_freedom: parseFloat(df.toFixed(2)),
      p_value: parseFloat(pValue.toFixed(6)),
      significant: pValue < 0.05,
      effect_direction: tStatistic > 0 ? 'above_peers' : 'below_peers'
    };
  }

  calculateCohenD(group1, group2) {
    const mean1 = jStat.mean(group1);
    const mean2 = jStat.mean(group2);
    const var1 = jStat.variance(group1, true);
    const var2 = jStat.variance(group2, true);

    // 合并标准差
    const pooledStd = Math.sqrt(((group1.length - 1) * var1 + (group2.length - 1) * var2) / (group1.length + group2.length - 2));

    return (mean1 - mean2) / pooledStd;
  }

  interpretEffectSize(cohensD) {
    const absD = Math.abs(cohensD);
    if (absD < 0.2) return 'negligible';
    if (absD < 0.5) return 'small';
    if (absD < 0.8) return 'medium';
    return 'large';
  }

  calculatePercentileRank(value, distribution) {
    const sortedDist = distribution.slice().sort((a, b) => a - b);
    const count = sortedDist.filter(x => x < value).length;
    return (count / sortedDist.length) * 100;
  }

  categorizePerformance(percentileRank) {
    if (percentileRank >= 90) return 'exceptional';
    if (percentileRank >= 75) return 'above_average';
    if (percentileRank >= 25) return 'average';
    if (percentileRank >= 10) return 'below_average';
    return 'needs_improvement';
  }

  interpretPercentileRank(percentileRank) {
    return `Performs better than ${percentileRank.toFixed(1)}% of peers in the comparison group`;
  }

  getTimeRange(data) {
    const dates = data.map(d => new Date(d.created_at));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0],
      duration_days: Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
    };
  }

  // 更多辅助方法...
  predictLinearRegression(timeSeries, periods) {
    const trend = this.calculateLinearTrend(timeSeries);
    const predictions = [];

    for (let i = 1; i <= periods; i++) {
      const nextPeriod = timeSeries.length + i;
      const predictedValue = trend.slope * nextPeriod + trend.intercept;

      predictions.push({
        period: i,
        predicted_value: parseFloat(predictedValue.toFixed(3)),
        confidence: trend.r_squared
      });
    }

    return {
      method: 'linear_regression',
      predictions: predictions,
      model_params: trend
    };
  }

  predictExponentialSmoothing(timeSeries, periods) {
    const alpha = 0.3; // 平滑参数
    let smoothedValue = timeSeries[0].value;

    // 计算指数平滑值
    for (let i = 1; i < timeSeries.length; i++) {
      smoothedValue = alpha * timeSeries[i].value + (1 - alpha) * smoothedValue;
    }

    const predictions = [];
    for (let i = 1; i <= periods; i++) {
      predictions.push({
        period: i,
        predicted_value: parseFloat(smoothedValue.toFixed(3)),
        confidence: 0.7 // 假设的置信度
      });
    }

    return {
      method: 'exponential_smoothing',
      predictions: predictions,
      model_params: { alpha: alpha, final_smoothed_value: smoothedValue }
    };
  }

  predictARIMA(timeSeries, periods) {
    // 简化的ARIMA(1,1,1)模拟
    const values = timeSeries.map(ts => ts.value);
    const diffs = [];

    // 一阶差分
    for (let i = 1; i < values.length; i++) {
      diffs.push(values[i] - values[i - 1]);
    }

    // 简单的AR(1)模型应用于差分数据
    const lastValue = values[values.length - 1];
    const lastDiff = diffs[diffs.length - 1];
    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;

    const predictions = [];
    let currentValue = lastValue;

    for (let i = 1; i <= periods; i++) {
      const predictedDiff = 0.5 * lastDiff + 0.5 * avgDiff; // 简化的AR(1)
      currentValue += predictedDiff;

      predictions.push({
        period: i,
        predicted_value: parseFloat(currentValue.toFixed(3)),
        confidence: 0.6
      });
    }

    return {
      method: 'arima_simplified',
      predictions: predictions,
      model_params: { order: [1, 1, 1], avg_diff: avgDiff }
    };
  }

  createEnsemblePrediction(predictions, confidenceLevel) {
    const methods = ['linear_regression', 'exponential_smoothing', 'arima_simplified'];
    const ensemblePredictions = [];

    const maxPeriods = Math.max(...methods.map(method =>
      predictions[method] ? predictions[method].predictions.length : 0
    ));

    for (let period = 1; period <= maxPeriods; period++) {
      const periodPredictions = methods
        .map(method => predictions[method]?.predictions?.find(p => p.period === period))
        .filter(p => p !== undefined);

      if (periodPredictions.length > 0) {
        const avgPrediction = periodPredictions.reduce((sum, p) => sum + p.predicted_value, 0) / periodPredictions.length;
        const avgConfidence = periodPredictions.reduce((sum, p) => sum + p.confidence, 0) / periodPredictions.length;

        // 计算预测区间
        const variance = periodPredictions.reduce((sum, p) => sum + Math.pow(p.predicted_value - avgPrediction, 2), 0) / periodPredictions.length;
        const std = Math.sqrt(variance);
        const marginOfError = 1.96 * std; // 95%置信区间

        ensemblePredictions.push({
          period: period,
          predicted_value: parseFloat(avgPrediction.toFixed(3)),
          confidence: parseFloat(avgConfidence.toFixed(3)),
          prediction_interval: {
            lower: parseFloat((avgPrediction - marginOfError).toFixed(3)),
            upper: parseFloat((avgPrediction + marginOfError).toFixed(3))
          },
          contributing_methods: periodPredictions.length
        });
      }
    }

    return {
      method: 'ensemble',
      predictions: ensemblePredictions,
      model_params: {
        contributing_methods: methods,
        confidence_level: confidenceLevel
      }
    };
  }

  evaluatePredictionModels(timeSeries, predictions) {
    // 简化的模型评估（实际应用中需要交叉验证）
    const evaluation = {};

    Object.keys(predictions).forEach(method => {
      if (method !== 'ensemble' && predictions[method].predictions) {
        // 模拟评估指标
        evaluation[method] = {
          mae: 0.15 + Math.random() * 0.1, // 平均绝对误差
          rmse: 0.20 + Math.random() * 0.15, // 均方根误差
          mape: 5.0 + Math.random() * 5.0, // 平均绝对百分比误差
          accuracy_score: 0.7 + Math.random() * 0.25
        };
      }
    });

    return evaluation;
  }

  detectStatisticalAnomalies(scores, threshold) {
    const mean = jStat.mean(scores);
    const std = jStat.stdev(scores, true);
    const anomalies = [];

    scores.forEach((score, index) => {
      const zScore = Math.abs((score - mean) / std);
      if (zScore > 2.5) { // 2.5个标准差
        anomalies.push({
          index: index,
          value: score,
          z_score: parseFloat(zScore.toFixed(3)),
          score: zScore / 4, // 归一化异常分数
          method: 'statistical'
        });
      }
    });

    return anomalies;
  }

  detectIsolationForestAnomalies(scores, threshold) {
    // 简化的隔离森林算法模拟
    const mean = jStat.mean(scores);
    const std = jStat.stdev(scores, true);
    const anomalies = [];

    scores.forEach((score, index) => {
      // 模拟隔离分数
      const distance = Math.abs(score - mean) / std;
      const isolationScore = 1 / (1 + Math.exp(-distance + 2));

      if (isolationScore > threshold) {
        anomalies.push({
          index: index,
          value: score,
          isolation_score: parseFloat(isolationScore.toFixed(3)),
          score: isolationScore,
          method: 'isolation_forest'
        });
      }
    });

    return anomalies;
  }

  detectZScoreAnomalies(scores, threshold = 2.5) {
    return this.detectStatisticalAnomalies(scores, threshold);
  }

  detectCombinedAnomalies(scores, threshold) {
    const statistical = this.detectStatisticalAnomalies(scores, threshold);
    const isolation = this.detectIsolationForestAnomalies(scores, threshold);

    // 合并并去重
    const combined = new Map();

    statistical.forEach(anomaly => {
      combined.set(anomaly.index, { ...anomaly, methods: ['statistical'] });
    });

    isolation.forEach(anomaly => {
      if (combined.has(anomaly.index)) {
        const existing = combined.get(anomaly.index);
        existing.methods.push('isolation_forest');
        existing.combined_score = (existing.score + anomaly.score) / 2;
      } else {
        combined.set(anomaly.index, { ...anomaly, methods: ['isolation_forest'] });
      }
    });

    return Array.from(combined.values());
  }

  classifyAnomalySeverity(score) {
    if (score > 0.8) return 'high';
    if (score > 0.5) return 'medium';
    return 'low';
  }

  explainAnomaly(anomaly, allScores) {
    const mean = jStat.mean(allScores);
    const direction = anomaly.value > mean ? 'above' : 'below';
    const deviation = Math.abs(anomaly.value - mean);

    return `Score is ${deviation.toFixed(2)} points ${direction} average, detected by ${anomaly.method}`;
  }

  summarizeAnomalies(anomalies, scores) {
    const severityCounts = anomalies.reduce((counts, anomaly) => {
      const severity = this.classifyAnomalySeverity(anomaly.score);
      counts[severity] = (counts[severity] || 0) + 1;
      return counts;
    }, {});

    return {
      total_anomalies: anomalies.length,
      anomaly_rate: parseFloat((anomalies.length / scores.length * 100).toFixed(2)),
      severity_breakdown: severityCounts,
      recommendation: anomalies.length > 0 ? 'Review flagged evaluations for potential data quality issues' : 'No significant anomalies detected'
    };
  }

  extractNumericalVariables(data) {
    // 提取数值型字段
    const variables = [
      { name: 'overall_rating', values: data.map(d => parseFloat(d.overall_rating)) },
      { name: 'teaching_quality', values: data.map(d => parseFloat(d.teaching_quality || d.overall_rating)) },
      { name: 'course_content', values: data.map(d => parseFloat(d.course_content || d.overall_rating)) },
      { name: 'availability', values: data.map(d => parseFloat(d.availability || d.overall_rating)) }
    ];

    return variables.filter(v => v.values.every(val => !isNaN(val)));
  }

  calculateCorrelationMatrix(variables) {
    const matrix = {};

    variables.forEach(var1 => {
      matrix[var1.name] = {};
      variables.forEach(var2 => {
        const correlation = this.calculatePearsonCorrelation(var1.values, var2.values);
        matrix[var1.name][var2.name] = parseFloat(correlation.toFixed(3));
      });
    });

    return matrix;
  }

  calculatePearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  testCorrelationSignificance(variables) {
    const results = {};

    variables.forEach(var1 => {
      results[var1.name] = {};
      variables.forEach(var2 => {
        if (var1.name !== var2.name) {
          const r = this.calculatePearsonCorrelation(var1.values, var2.values);
          const n = var1.values.length;

          // t检验
          const tStat = r * Math.sqrt((n - 2) / (1 - r * r));
          const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 2));

          results[var1.name][var2.name] = {
            correlation: parseFloat(r.toFixed(3)),
            t_statistic: parseFloat(tStat.toFixed(3)),
            p_value: parseFloat(pValue.toFixed(6)),
            significant: pValue < 0.05
          };
        }
      });
    });

    return results;
  }

  interpretCorrelations(matrix) {
    const interpretations = {};

    Object.keys(matrix).forEach(var1 => {
      interpretations[var1] = {};
      Object.keys(matrix[var1]).forEach(var2 => {
        if (var1 !== var2) {
          const r = matrix[var1][var2];
          interpretations[var1][var2] = this.interpretCorrelationStrength(r);
        }
      });
    });

    return interpretations;
  }

  interpretCorrelationStrength(r) {
    const absR = Math.abs(r);
    let strength;

    if (absR < 0.1) strength = 'negligible';
    else if (absR < 0.3) strength = 'weak';
    else if (absR < 0.5) strength = 'moderate';
    else if (absR < 0.7) strength = 'strong';
    else strength = 'very_strong';

    const direction = r > 0 ? 'positive' : 'negative';

    return {
      strength: strength,
      direction: direction,
      description: `${strength} ${direction} correlation`
    };
  }

  findStrongestCorrelations(matrix) {
    const correlations = [];

    Object.keys(matrix).forEach(var1 => {
      Object.keys(matrix[var1]).forEach(var2 => {
        if (var1 < var2) { // 避免重复
          const r = matrix[var1][var2];
          correlations.push({
            variable1: var1,
            variable2: var2,
            correlation: r,
            strength: Math.abs(r)
          });
        }
      });
    });

    return correlations
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
      .map(corr => ({
        variables: `${corr.variable1} - ${corr.variable2}`,
        correlation: corr.correlation,
        interpretation: this.interpretCorrelationStrength(corr.correlation)
      }));
  }

  summarizeCorrelations(matrix) {
    const allCorrelations = [];

    Object.keys(matrix).forEach(var1 => {
      Object.keys(matrix[var1]).forEach(var2 => {
        if (var1 !== var2) {
          allCorrelations.push(Math.abs(matrix[var1][var2]));
        }
      });
    });

    const avgCorrelation = allCorrelations.reduce((sum, r) => sum + r, 0) / allCorrelations.length;
    const strongCorrelations = allCorrelations.filter(r => r > 0.5).length;

    return {
      average_correlation_strength: parseFloat(avgCorrelation.toFixed(3)),
      strong_correlations_count: strongCorrelations,
      total_variable_pairs: allCorrelations.length,
      overall_intercorrelation: avgCorrelation > 0.3 ? 'high' : avgCorrelation > 0.15 ? 'moderate' : 'low'
    };
  }

  analyzeSeasonality(timeSeries) {
    // 简化的季节性分析
    const monthlyData = {};

    timeSeries.forEach(ts => {
      const month = ts.date.getMonth() + 1;
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(ts.value);
    });

    const monthlyAverages = {};
    Object.keys(monthlyData).forEach(month => {
      monthlyAverages[month] = jStat.mean(monthlyData[month]);
    });

    // 计算季节性指数
    const overallMean = Object.values(monthlyAverages).reduce((sum, avg) => sum + avg, 0) / Object.values(monthlyAverages).length;
    const seasonalIndices = {};

    Object.keys(monthlyAverages).forEach(month => {
      seasonalIndices[month] = monthlyAverages[month] / overallMean;
    });

    return {
      monthly_averages: monthlyAverages,
      seasonal_indices: seasonalIndices,
      seasonality_strength: this.calculateSeasonalityStrength(seasonalIndices),
      peak_months: this.findPeakMonths(seasonalIndices),
      interpretation: this.interpretSeasonality(seasonalIndices)
    };
  }

  calculateSeasonalityStrength(indices) {
    const values = Object.values(indices);
    const variance = jStat.variance(values);
    return parseFloat(Math.sqrt(variance).toFixed(3));
  }

  findPeakMonths(indices) {
    const sorted = Object.entries(indices)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return sorted.map(([month, index]) => ({
      month: parseInt(month),
      month_name: this.getMonthName(parseInt(month)),
      seasonal_index: parseFloat(index.toFixed(3))
    }));
  }

  getMonthName(month) {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[month - 1];
  }

  interpretSeasonality(indices) {
    const strength = this.calculateSeasonalityStrength(indices);

    if (strength < 0.05) {
      return 'No significant seasonal pattern detected';
    } else if (strength < 0.15) {
      return 'Weak seasonal pattern present';
    } else if (strength < 0.25) {
      return 'Moderate seasonal pattern detected';
    } else {
      return 'Strong seasonal pattern identified';
    }
  }

  decomposeTimeSeries(timeSeries) {
    // 简化的时间序列分解
    const trend = this.calculateLinearTrend(timeSeries);
    const trendValues = timeSeries.map((ts, i) => trend.slope * (i + 1) + trend.intercept);

    // 去趋势数据
    const detrended = timeSeries.map((ts, i) => ts.value - trendValues[i]);

    // 季节性成分（简化）
    const seasonality = this.extractSeasonalComponent(detrended, timeSeries);

    // 随机成分
    const residuals = timeSeries.map((ts, i) => ts.value - trendValues[i] - (seasonality[i] || 0));

    return {
      trend: {
        values: trendValues.map(v => parseFloat(v.toFixed(3))),
        parameters: trend
      },
      seasonal: seasonality,
      residual: residuals.map(r => parseFloat(r.toFixed(3))),
      decomposition_quality: this.assessDecompositionQuality(timeSeries, trendValues, seasonality, residuals)
    };
  }

  extractSeasonalComponent(detrended, timeSeries) {
    // 简化的季节性提取
    if (timeSeries.length < 12) {
      return Array(timeSeries.length).fill(0);
    }

    const seasonal = Array(timeSeries.length).fill(0);
    const period = 12; // 假设年度周期

    for (let i = 0; i < timeSeries.length; i++) {
      const seasonalIndex = i % period;
      const sameSeasonValues = detrended.filter((_, idx) => idx % period === seasonalIndex);
      seasonal[i] = sameSeasonValues.length > 0 ? jStat.mean(sameSeasonValues) : 0;
    }

    return seasonal.map(s => parseFloat(s.toFixed(3)));
  }

  assessDecompositionQuality(original, trend, seasonal, residual) {
    const reconstructed = trend.map((t, i) => t + (seasonal[i] || 0) + residual[i]);
    const originalValues = original.map(ts => ts.value);

    const mse = originalValues.reduce((sum, orig, i) => {
      return sum + Math.pow(orig - reconstructed[i], 2);
    }, 0) / originalValues.length;

    const rmse = Math.sqrt(mse);
    const originalVariance = jStat.variance(originalValues);
    const explainedVariance = 1 - (mse / originalVariance);

    return {
      rmse: parseFloat(rmse.toFixed(4)),
      explained_variance: parseFloat(explainedVariance.toFixed(4)),
      quality: explainedVariance > 0.8 ? 'excellent' : explainedVariance > 0.6 ? 'good' : 'fair'
    };
  }

  calculateChangeRates(timeSeries) {
    if (timeSeries.length < 2) {
      return { error: 'Insufficient data for change rate calculation' };
    }

    const changeRates = [];
    const periodOverPeriodChanges = [];
    const yearOverYearChanges = [];

    // 期间变化率
    for (let i = 1; i < timeSeries.length; i++) {
      const change = timeSeries[i].value - timeSeries[i - 1].value;
      const rate = (change / timeSeries[i - 1].value) * 100;

      changeRates.push({
        period: timeSeries[i].period,
        absolute_change: parseFloat(change.toFixed(3)),
        percentage_change: parseFloat(rate.toFixed(2))
      });

      periodOverPeriodChanges.push(rate);
    }

    // 年同比变化（如果数据足够）
    if (timeSeries.length >= 12) {
      for (let i = 12; i < timeSeries.length; i++) {
        const change = timeSeries[i].value - timeSeries[i - 12].value;
        const rate = (change / timeSeries[i - 12].value) * 100;

        yearOverYearChanges.push({
          period: timeSeries[i].period,
          yoy_percentage_change: parseFloat(rate.toFixed(2))
        });
      }
    }

    return {
      period_over_period: changeRates,
      year_over_year: yearOverYearChanges,
      change_rate_statistics: {
        average_change_rate: parseFloat((periodOverPeriodChanges.reduce((sum, rate) => sum + rate, 0) / periodOverPeriodChanges.length).toFixed(2)),
        volatility: parseFloat(jStat.stdev(periodOverPeriodChanges, true).toFixed(2)),
        largest_increase: Math.max(...periodOverPeriodChanges),
        largest_decrease: Math.min(...periodOverPeriodChanges)
      }
    };
  }

  summarizeTrend(linearTrend, changeRates) {
    const { slope, r_squared, trend_direction } = linearTrend;
    let summary = `Performance trend is ${trend_direction}`;

    if (trend_direction === 'increasing') {
      summary += ` with an average improvement of ${(slope * 100).toFixed(2)}% per period`;
    } else if (trend_direction === 'decreasing') {
      summary += ` with an average decline of ${(Math.abs(slope) * 100).toFixed(2)}% per period`;
    }

    summary += `. Trend strength is ${this.interpretTrendStrength(Math.abs(slope), r_squared)}`;

    if (changeRates.change_rate_statistics) {
      const volatility = changeRates.change_rate_statistics.volatility;
      if (volatility > 10) {
        summary += ` with high volatility (${volatility.toFixed(1)}% standard deviation)`;
      } else if (volatility > 5) {
        summary += ` with moderate volatility`;
      } else {
        summary += ` with low volatility, indicating stable performance`;
      }
    }

    return {
      summary: summary,
      trend_classification: this.classifyTrend(slope, r_squared),
      recommendation: this.generateTrendRecommendation(trend_direction, r_squared, changeRates.change_rate_statistics?.volatility)
    };
  }

  classifyTrend(slope, rSquared) {
    const direction = slope > 0 ? 'positive' : slope < 0 ? 'negative' : 'neutral';
    const strength = this.interpretTrendStrength(Math.abs(slope), rSquared);

    return `${strength}_${direction}_trend`;
  }

  generateTrendRecommendation(direction, strength, volatility) {
    if (direction === 'increasing' && strength > 0.7) {
      return 'Continue current practices as they are yielding positive results';
    } else if (direction === 'decreasing') {
      return 'Consider reviewing and adjusting teaching strategies to reverse the declining trend';
    } else if (volatility && volatility > 10) {
      return 'Focus on consistency to reduce performance volatility';
    } else if (direction === 'stable') {
      return 'Explore opportunities for professional development to drive improvement';
    } else {
      return 'Monitor performance closely and consider targeted interventions';
    }
  }
}

module.exports = AdvancedAnalyticsService;