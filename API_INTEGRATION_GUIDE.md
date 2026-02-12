# B147 Chat System - API Integration Guide

## 概述

本文档说明如何将真实 API 接入到 B147 聊天系统中，替换当前的 Mock 响应。

---

## API 接口规范

### 端点 (Endpoint)

```
POST /api/chat
```

### 请求格式 (Request)

```json
{
  "phase": 1,                    // 当前对话阶段 (1-4)
  "userMessage": "用户输入的消息",
  "conversationHistory": [       // 对话历史
    {
      "role": "sentinel",        // 或 "operator"
      "text": "消息内容",
      "timestamp": 1234567890
    },
    ...
  ]
}
```

### 响应格式 (Response)

```json
{
  "messages": [                  // AI 回复的消息数组
    "消息1",
    "消息2",
    ...
  ],
  "nextPhase": 2,                // 可选：下一个阶段
  "shouldEnd": false             // 可选：是否结束对话
}
```

---

## 集成步骤

### 1. 找到 API 调用函数

在 `js/b147-chat-system.js` 中找到以下函数：

```javascript
async function sendToAI(userMessage) {
    try {
        // TODO: 替换为真实 API 调用
        // const response = await fetch(CONFIG.api.endpoint, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         phase: state.currentPhase,
        //         userMessage: userMessage,
        //         conversationHistory: state.conversationHistory
        //     })
        // });
        // const data = await response.json();
        // return data.messages;
        
        // 临时 Mock 响应
        return await mockAPIResponse(userMessage);
        
    } catch (error) {
        console.error('API Error:', error);
        return ['信号中断，请稍后重试...'];
    }
}
```

### 2. 替换为真实 API

将注释的代码取消注释，并删除 Mock 调用：

```javascript
async function sendToAI(userMessage) {
    try {
        const response = await fetch(CONFIG.api.endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
                // 如果需要认证，添加：
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify({
                phase: state.currentPhase,
                userMessage: userMessage,
                conversationHistory: state.conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.messages;
        
    } catch (error) {
        console.error('API Error:', error);
        return ['信号中断，请稍后重试...'];
    }
}
```

### 3. 更新 API 端点

在文件顶部的 `CONFIG` 对象中更新 API 端点：

```javascript
const CONFIG = {
    // ...
    api: {
        endpoint: 'https://your-api-domain.com/api/chat',  // 替换为您的 API 地址
        timeout: 30000
    }
};
```

### 4. 删除 Mock 函数（可选）

找到并删除 `mockAPIResponse` 函数（约在第 200-230 行）：

```javascript
/**
 * Mock API 响应（临时测试用）
 */
async function mockAPIResponse(userMessage) {
    // ... 可以删除整个函数
}
```

---

## 高级配置

### 添加认证

如果您的 API 需要认证：

```javascript
async function sendToAI(userMessage) {
    const token = 'YOUR_API_TOKEN';  // 或从某处获取
    
    const response = await fetch(CONFIG.api.endpoint, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({...})
    });
    // ...
}
```

### 添加超时处理

```javascript
async function sendToAI(userMessage) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);
    
    try {
        const response = await fetch(CONFIG.api.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...}),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        return data.messages;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            return ['连接超时，正在重新建立连接...'];
        }
        return ['信号中断，请稍后重试...'];
    }
}
```

### 处理阶段转换

如果 API 返回 `nextPhase`，可以自动更新阶段：

```javascript
const data = await response.json();

// 如果 API 指定了下一个阶段
if (data.nextPhase !== undefined) {
    state.currentPhase = data.nextPhase;
}

// 如果 API 指定对话应该结束
if (data.shouldEnd) {
    showDialogueEnd();
    return data.messages;
}

return data.messages;
```

---

## 测试建议

### 1. 使用浏览器开发者工具

打开浏览器控制台 (F12)，查看：
- Network 标签：检查 API 请求和响应
- Console 标签：查看错误日志

### 2. 测试不同场景

- ✅ 正常对话流程
- ✅ 网络错误
- ✅ API 超时
- ✅ 无效响应格式
- ✅ 空消息数组

### 3. 验证对话阶段

确保 API 正确处理不同阶段：
- Phase 1: 诱导雪花
- Phase 2: 感知连接
- Phase 3: 获取标识
- Phase 4: 记忆刻录

---

## 常见问题

### Q: API 返回的消息数组为空怎么办？

A: 添加检查：

```javascript
const data = await response.json();
if (!data.messages || data.messages.length === 0) {
    return ['收到信号，但内容为空...'];
}
return data.messages;
```

### Q: 如何处理 CORS 错误？

A: 确保您的 API 服务器设置了正确的 CORS 头：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Q: 如何调试 API 调用？

A: 添加详细日志：

```javascript
console.log('Sending to API:', {
    phase: state.currentPhase,
    userMessage: userMessage,
    historyLength: state.conversationHistory.length
});

const data = await response.json();
console.log('Received from API:', data);
```

---

## 完整示例

```javascript
async function sendToAI(userMessage) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);
    
    try {
        console.log('📤 Sending to API:', {
            phase: state.currentPhase,
            message: userMessage
        });
        
        const response = await fetch(CONFIG.api.endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN'  // 如果需要
            },
            body: JSON.stringify({
                phase: state.currentPhase,
                userMessage: userMessage,
                conversationHistory: state.conversationHistory
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Received from API:', data);
        
        // 验证响应格式
        if (!data.messages || !Array.isArray(data.messages)) {
            throw new Error('Invalid response format');
        }
        
        // 处理阶段转换
        if (data.nextPhase !== undefined) {
            state.currentPhase = data.nextPhase;
        }
        
        // 处理对话结束
        if (data.shouldEnd) {
            setTimeout(() => showDialogueEnd(), 1000);
        }
        
        return data.messages;
        
    } catch (error) {
        console.error('❌ API Error:', error);
        
        if (error.name === 'AbortError') {
            return ['连接超时，正在重新建立连接...'];
        }
        
        return ['信号中断，请稍后重试...'];
    }
}
```

---

**准备就绪后**，只需替换 `sendToAI` 函数和 API 端点配置即可！
