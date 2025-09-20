/**
 * Webhook Management Routes
 * 模拟 Schoolday Webhook 系统 - 实时事件推送
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const router = express.Router();

// 存储 webhook 订阅和事件
const webhookSubscriptions = new Map();
const webhookEvents = [];
const deliveryAttempts = new Map();

// 验证中间件
function authenticateWebhook(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Bearer token required for Webhook API access'
    });
  }

  next();
}

router.use(authenticateWebhook);

/**
 * Webhook API Info
 */
router.get('/', (req, res) => {
  res.json({
    service: 'Schoolday Webhook API',
    version: '2.0',
    description: 'Real-time event notification system',
    endpoints: {
      subscriptions: '/subscriptions',
      events: '/events',
      deliveries: '/deliveries'
    },
    supported_events: [
      'teacher.created',
      'teacher.updated',
      'teacher.evaluation.submitted',
      'course.created',
      'course.updated',
      'enrollment.created',
      'enrollment.completed',
      'academy.course.enrolled',
      'academy.course.completed',
      'system.maintenance.scheduled'
    ],
    features: [
      'Automatic retry with exponential backoff',
      'Event filtering by type and organization',
      'Webhook signature verification',
      'Delivery status tracking',
      'Test webhook functionality'
    ]
  });
});

/**
 * Create Webhook Subscription
 */
router.post('/subscriptions', (req, res) => {
  try {
    const {
      url,
      events,
      organization_id,
      description,
      secret
    } = req.body;

    // 验证必需字段
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'url and events array are required'
      });
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'invalid_url',
        message: 'Invalid webhook URL format'
      });
    }

    // 验证事件类型
    const supportedEvents = [
      'teacher.created', 'teacher.updated', 'teacher.evaluation.submitted',
      'course.created', 'course.updated',
      'enrollment.created', 'enrollment.completed',
      'academy.course.enrolled', 'academy.course.completed',
      'system.maintenance.scheduled'
    ];

    const invalidEvents = events.filter(event => !supportedEvents.includes(event));
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        error: 'invalid_events',
        message: `Unsupported event types: ${invalidEvents.join(', ')}`,
        supported_events: supportedEvents
      });
    }

    const subscriptionId = uuidv4();
    const subscription = {
      id: subscriptionId,
      url,
      events,
      organization_id: organization_id || null,
      description: description || '',
      secret: secret || generateSecret(),
      status: 'active',
      created_at: new Date().toISOString(),
      last_delivery: null,
      delivery_success_rate: 100,
      total_deliveries: 0,
      failed_deliveries: 0
    };

    webhookSubscriptions.set(subscriptionId, subscription);

    // 发送测试事件
    setTimeout(() => {
      sendTestEvent(subscription);
    }, 1000);

    res.status(201).json({
      subscription: {
        ...subscription,
        secret: '***masked***' // 不返回实际密钥
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Webhook Subscriptions
 */
router.get('/subscriptions', (req, res) => {
  try {
    const { organization_id, status } = req.query;

    let subscriptions = Array.from(webhookSubscriptions.values());

    // 应用过滤器
    if (organization_id) {
      subscriptions = subscriptions.filter(s => s.organization_id === organization_id);
    }

    if (status) {
      subscriptions = subscriptions.filter(s => s.status === status);
    }

    // 隐藏密钥
    const maskedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      secret: '***masked***'
    }));

    res.json({
      subscriptions: maskedSubscriptions,
      total: maskedSubscriptions.length
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Subscription by ID
 */
router.get('/subscriptions/:id', (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = webhookSubscriptions.get(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        error: 'not_found',
        message: `Subscription with ID ${subscriptionId} not found`
      });
    }

    res.json({
      subscription: {
        ...subscription,
        secret: '***masked***'
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Update Webhook Subscription
 */
router.put('/subscriptions/:id', (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = webhookSubscriptions.get(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        error: 'not_found',
        message: `Subscription with ID ${subscriptionId} not found`
      });
    }

    const { url, events, status, description } = req.body;

    // 更新字段
    if (url) {
      try {
        new URL(url);
        subscription.url = url;
      } catch {
        return res.status(400).json({
          error: 'invalid_url',
          message: 'Invalid webhook URL format'
        });
      }
    }

    if (events && Array.isArray(events)) {
      subscription.events = events;
    }

    if (status && ['active', 'paused', 'disabled'].includes(status)) {
      subscription.status = status;
    }

    if (description !== undefined) {
      subscription.description = description;
    }

    subscription.updated_at = new Date().toISOString();

    webhookSubscriptions.set(subscriptionId, subscription);

    res.json({
      subscription: {
        ...subscription,
        secret: '***masked***'
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Delete Webhook Subscription
 */
router.delete('/subscriptions/:id', (req, res) => {
  try {
    const subscriptionId = req.params.id;

    if (!webhookSubscriptions.has(subscriptionId)) {
      return res.status(404).json({
        error: 'not_found',
        message: `Subscription with ID ${subscriptionId} not found`
      });
    }

    webhookSubscriptions.delete(subscriptionId);

    res.status(204).send();

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Test Webhook Subscription
 */
router.post('/subscriptions/:id/test', async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = webhookSubscriptions.get(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        error: 'not_found',
        message: `Subscription with ID ${subscriptionId} not found`
      });
    }

    const testEvent = {
      id: uuidv4(),
      type: 'webhook.test',
      data: {
        test: true,
        subscription_id: subscriptionId,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const delivery = await deliverWebhook(subscription, testEvent);

    res.json({
      test_delivery: delivery,
      message: 'Test webhook sent'
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Recent Events
 */
router.get('/events', (req, res) => {
  try {
    const {
      type,
      organization_id,
      limit = 50,
      offset = 0
    } = req.query;

    let events = webhookEvents.slice();

    // 应用过滤器
    if (type) {
      events = events.filter(e => e.type === type);
    }

    if (organization_id) {
      events = events.filter(e => e.organization_id === organization_id);
    }

    // 按时间排序（最新的在前）
    events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 分页
    const total = events.length;
    const paginatedEvents = events.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      events: paginatedEvents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Delivery Status for Subscription
 */
router.get('/subscriptions/:id/deliveries', (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = webhookSubscriptions.get(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        error: 'not_found',
        message: `Subscription with ID ${subscriptionId} not found`
      });
    }

    const deliveries = Array.from(deliveryAttempts.values())
      .filter(delivery => delivery.subscription_id === subscriptionId)
      .sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at))
      .slice(0, 50); // 最近50次发送

    res.json({
      subscription_id: subscriptionId,
      deliveries,
      summary: {
        total_attempts: subscription.total_deliveries,
        failed_attempts: subscription.failed_deliveries,
        success_rate: subscription.delivery_success_rate
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Manually Trigger Event (for testing)
 */
router.post('/events/trigger', (req, res) => {
  try {
    const { type, data, organization_id } = req.body;

    if (!type) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'Event type is required'
      });
    }

    const event = {
      id: uuidv4(),
      type,
      data: data || {},
      organization_id: organization_id || null,
      created_at: new Date().toISOString()
    };

    // 触发事件
    triggerEvent(event);

    res.status(201).json({
      event,
      message: 'Event triggered successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// 辅助函数

function generateSecret() {
  return 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function sendTestEvent(subscription) {
  const testEvent = {
    id: uuidv4(),
    type: 'subscription.created',
    data: {
      subscription_id: subscription.id,
      url: subscription.url,
      events: subscription.events
    },
    created_at: new Date().toISOString()
  };

  await deliverWebhook(subscription, testEvent);
}

async function deliverWebhook(subscription, event) {
  const deliveryId = uuidv4();
  const delivery = {
    id: deliveryId,
    subscription_id: subscription.id,
    event_id: event.id,
    event_type: event.type,
    url: subscription.url,
    attempted_at: new Date().toISOString(),
    status: 'pending',
    response_status: null,
    response_time_ms: null,
    error_message: null
  };

  try {
    const startTime = Date.now();

    // 创建签名
    const signature = createWebhookSignature(JSON.stringify(event), subscription.secret);

    const response = await axios.post(subscription.url, event, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': event.id,
        'X-Webhook-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'User-Agent': 'Schoolday-Webhook/2.0'
      },
      timeout: 10000 // 10秒超时
    });

    const responseTime = Date.now() - startTime;

    delivery.status = 'delivered';
    delivery.response_status = response.status;
    delivery.response_time_ms = responseTime;

    // 更新订阅统计
    subscription.total_deliveries++;
    subscription.last_delivery = delivery.attempted_at;
    subscription.delivery_success_rate = Math.round(
      ((subscription.total_deliveries - subscription.failed_deliveries) / subscription.total_deliveries) * 100
    );

  } catch (error) {
    delivery.status = 'failed';
    delivery.error_message = error.message;

    // 更新订阅统计
    subscription.total_deliveries++;
    subscription.failed_deliveries++;
    subscription.delivery_success_rate = Math.round(
      ((subscription.total_deliveries - subscription.failed_deliveries) / subscription.total_deliveries) * 100
    );

    // 计划重试（实际实现中应该使用队列系统）
    if (subscription.failed_deliveries <= 3) {
      setTimeout(() => {
        deliverWebhook(subscription, event);
      }, Math.pow(2, subscription.failed_deliveries) * 1000); // 指数退避
    }
  }

  deliveryAttempts.set(deliveryId, delivery);
  return delivery;
}

function createWebhookSignature(payload, secret) {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return 'sha256=' + hmac.digest('hex');
}

function triggerEvent(event) {
  // 存储事件
  webhookEvents.push(event);

  // 保持最近1000个事件
  if (webhookEvents.length > 1000) {
    webhookEvents.splice(0, webhookEvents.length - 1000);
  }

  // 找到匹配的订阅并发送
  webhookSubscriptions.forEach(subscription => {
    if (subscription.status === 'active' &&
        subscription.events.includes(event.type) &&
        (!subscription.organization_id || subscription.organization_id === event.organization_id)) {

      deliverWebhook(subscription, event);
    }
  });
}

// 定期生成模拟事件
setInterval(() => {
  const eventTypes = [
    'teacher.updated',
    'course.created',
    'enrollment.created',
    'academy.course.completed'
  ];

  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const mockEvent = {
    id: uuidv4(),
    type: randomType,
    data: {
      timestamp: new Date().toISOString(),
      mock: true
    },
    organization_id: 'district_' + Math.floor(Math.random() * 5 + 1),
    created_at: new Date().toISOString()
  };

  triggerEvent(mockEvent);
}, 30000); // 每30秒一个模拟事件

module.exports = router;