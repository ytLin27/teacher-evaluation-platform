// InfluxDB 初始化脚本
// 时序数据：教师绩效指标、评价趋势、系统监控等

// 创建组织和初始用户
import "influxdata/influxdb/schema"

// 1. 教师绩效时序数据 Bucket
option task = {name: "init_teacher_metrics", every: 1h}

// 创建 Buckets
// teacher_metrics: 教师绩效指标时序数据
bucketName = "teacher_metrics"
retention = 365d // 保留一年数据

// evaluation_trends: 评价趋势数据
evaluationBucket = "evaluation_trends"
evaluationRetention = 730d // 保留两年评价趋势

// system_metrics: 系统性能监控
systemBucket = "system_metrics"
systemRetention = 90d // 保留三个月系统指标

// 教师绩效指标数据结构示例：
// Measurement: teacher_performance
// Tags:
//   - teacher_id: 教师ID
//   - department: 部门
//   - position: 职位
//   - metric_type: 指标类型 (teaching, research, service, overall)
// Fields:
//   - score: 评分 (float)
//   - percentile: 百分位数 (float)
//   - trend: 趋势 (string: "improving", "stable", "declining")
//   - sample_size: 样本大小 (int)

// 学生评价趋势数据结构：
// Measurement: student_evaluations
// Tags:
//   - teacher_id: 教师ID
//   - course_id: 课程ID
//   - semester: 学期
//   - evaluation_type: 评价类型
// Fields:
//   - overall_rating: 总体评分 (float)
//   - teaching_quality: 教学质量 (float)
//   - course_content: 课程内容 (float)
//   - availability: 可用性 (float)
//   - response_count: 回复数量 (int)

// 研究产出趋势：
// Measurement: research_output
// Tags:
//   - teacher_id: 教师ID
//   - output_type: 产出类型 (publication, grant, patent)
//   - department: 部门
// Fields:
//   - count: 数量 (int)
//   - total_impact: 总影响力 (float)
//   - funding_amount: 资助金额 (float)

// 服务贡献趋势：
// Measurement: service_contribution
// Tags:
//   - teacher_id: 教师ID
//   - service_type: 服务类型
//   - scope: 范围 (local, national, international)
// Fields:
//   - hours: 小时数 (int)
//   - impact_score: 影响评分 (float)

// 专业发展趋势：
// Measurement: professional_development
// Tags:
//   - teacher_id: 教师ID
//   - development_type: 发展类型
//   - provider: 提供方
// Fields:
//   - hours_completed: 完成小时数 (int)
//   - cost: 成本 (float)
//   - skill_count: 技能数量 (int)

// 同行比较基准：
// Measurement: peer_benchmarks
// Tags:
//   - department: 部门
//   - position: 职位
//   - metric_type: 指标类型
// Fields:
//   - mean: 平均值 (float)
//   - median: 中位数 (float)
//   - p25: 25分位数 (float)
//   - p75: 75分位数 (float)
//   - p90: 90分位数 (float)
//   - std_dev: 标准差 (float)

// 系统性能监控：
// Measurement: api_performance
// Tags:
//   - service: 服务名
//   - endpoint: API端点
//   - method: HTTP方法
//   - status_code: 状态码
// Fields:
//   - response_time: 响应时间 (float, ms)
//   - throughput: 吞吐量 (int, requests/second)
//   - error_rate: 错误率 (float, percentage)

// 数据库性能：
// Measurement: database_performance
// Tags:
//   - database: 数据库名 (postgres, mongodb, influxdb)
//   - operation: 操作类型 (select, insert, update, delete)
// Fields:
//   - query_time: 查询时间 (float, ms)
//   - connection_count: 连接数 (int)
//   - cpu_usage: CPU使用率 (float, percentage)
//   - memory_usage: 内存使用 (float, MB)

// Schoolday同步状态：
// Measurement: schoolday_sync
// Tags:
//   - sync_type: 同步类型 (teachers, courses, evaluations)
//   - status: 状态 (success, failure, partial)
// Fields:
//   - records_synced: 同步记录数 (int)
//   - sync_duration: 同步耗时 (float, seconds)
//   - error_count: 错误数量 (int)

// 用户活动：
// Measurement: user_activity
// Tags:
//   - user_id: 用户ID
//   - user_role: 用户角色
//   - action: 操作类型
//   - page: 页面
// Fields:
//   - session_duration: 会话时长 (float, minutes)
//   - page_views: 页面浏览量 (int)
//   - actions_count: 操作次数 (int)