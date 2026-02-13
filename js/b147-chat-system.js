/**
 * B147 AI Chat System - BUG FIX VERSION
 * 
 * 核心修复：
 * 1. ✅ AI 已经正确输出 ||| 分隔符
 * 2. ❌ 前端没有正确分割和显示
 * 3. 🔧 修复：在 handleSend 中正确处理 AI 返回的多条消息
 */

// ==================== 配置 ====================

const CONFIG = {
    typewriter: {
        charDelay: 60,
        punctuationDelay: 200,
        messageGap: 1000,
        punctuationMarks: ['。', '，', '！', '？', '…', '.', ',', '!', '?', ':', '：', '——', '—']
    },

    phase0Messages: [
        { text: "哨兵B147，请求与向导连接。", instant: true, delay: 0 },
        { text: "重复：哨兵B147，请求与向导连接。", delay: 2000 },
        { text: "……有人吗？", delay: 2000 },
        { text: "有人吗有人吗有人吗，理我一下求求你求求你求求你 ˃̣̣̥ ˂̣̣̥", delay: 2000 }
    ],

    api: {
        endpoint: 'https://api.deepseek.com/chat/completions',
        apiKey: 'sk-3f2f2f9b165f41819ff9f9a1857cefca',
        timeout: 30000,
        maxRetries: 2,
        retryDelay: 1000
    }
};

// ==================== 全局状态 ====================

const state = {
    currentPhase: 0,
    conversationHistory: [],
    userInputEnabled: false,
    dialogueEnded: false,
    isProcessing: false,
    phase0Interrupted: false,
    playerName: null
};

// ==================== DOM 元素 ====================

const elements = {
    chatbox: document.getElementById('chatbox'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn')
};

// ==================== 消息队列系统 ====================

class MessageQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    add(text, isOperator = false, options = {}) {
        const finalOptions = {
            instant: isOperator,
            ...options
        };
        this.queue.push({ text, isOperator, options: finalOptions });
        if (!this.isProcessing) {
            this.process();
        }
    }

    async process() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            state.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        state.isProcessing = true;

        const { text, isOperator, options } = this.queue.shift();

        if (options.preDelay) {
            await this.delay(options.preDelay);
        }

        const messageElement = this.createMessageElement(text, isOperator);
        elements.chatbox.appendChild(messageElement);
        const contentElement = messageElement.querySelector('p');

        if (options.instant) {
            contentElement.textContent = text;
            this.scrollToBottom();
        } else {
            await this.typewriterEffect(contentElement, text);
            this.scrollToBottom();
        }

        await this.delay(CONFIG.typewriter.messageGap);
        this.process();
    }

    createMessageElement(text, isOperator) {
        const row = document.createElement('div');
        row.className = `message-row ${isOperator ? 'message-operator' : 'message-sentinel'}`;

        const meta = isOperator ?
            `<span>[OPERATOR_UNKNOWN] // UPLINK</span> <span class="text-[var(--primary)]">>>></span>` :
            `<span class="text-xl">⚔️</span> <span>[SENTINEL_B147] // INCOMING STREAM</span>`;

        const colorClass = isOperator ? 'text-[var(--primary)]' : 'text-gray-300';
        const techFooter = isOperator ?
            'UPLOAD STATUS: SUCCESS' :
            'SIGNAL PURITY: 94%';

        row.innerHTML = `
            <div class="message-meta">${meta}</div>
            <div class="message-bubble">
                <p class="${colorClass} text-lg"></p>
                <div class="tech-footer ${isOperator ? 'text-[var(--primary)]/70' : 'text-[var(--accent)]/70'}">
                    ${techFooter}
                </div>
            </div>
        `;

        return row;
    }

    async typewriterEffect(element, text) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            if (i % 5 === 0) this.scrollToBottom();

            const isPunctuation = CONFIG.typewriter.punctuationMarks.includes(text[i]);
            const delay = isPunctuation ?
                CONFIG.typewriter.charDelay + CONFIG.typewriter.punctuationDelay :
                CONFIG.typewriter.charDelay;

            await this.delay(delay);
        }
        this.scrollToBottom();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            elements.chatbox.scrollTop = elements.chatbox.scrollHeight;
        });
    }

    clear() {
        this.queue = [];
    }
}

const messageQueue = new MessageQueue();

// ==================== Phase 0 自动播放 ====================

async function startPhase0() {
    state.currentPhase = 0;
    state.userInputEnabled = false;
    elements.chatbox.innerHTML = '';

    for (let i = 0; i < CONFIG.phase0Messages.length; i++) {
        if (state.phase0Interrupted) break;

        const msg = CONFIG.phase0Messages[i];
        messageQueue.add(msg.text, false, {
            instant: msg.instant,
            preDelay: msg.delay || 0
        });

        await waitForQueueEmpty();
    }

    if (!state.phase0Interrupted) {
        enableUserInput();
    }
}

function waitForQueueEmpty() {
    return new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (!messageQueue.isProcessing && messageQueue.queue.length === 0) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

function enableUserInput() {
    state.userInputEnabled = true;
    elements.userInput.disabled = false;
    elements.sendBtn.disabled = false;
    const inputArea = document.querySelector('.terminal-input-area');
    if (inputArea) inputArea.classList.add('input-active');
}

function disableUserInput() {
    state.userInputEnabled = false;
    elements.userInput.disabled = true;
    elements.sendBtn.disabled = true;
    const inputArea = document.querySelector('.terminal-input-area');
    if (inputArea) inputArea.classList.remove('input-active');
}

// ==================== PROMPT 系统 ====================

const SYSTEM_CORE = `你是哨兵 B147。

━━━ 铁律（绝不违反）━━━
1. 禁止提及：雪鸮
2. 禁止提及：精神动物死亡
3. 禁止提及：被困原因
4. 禁止使用：(笑)、(叹气) 等括号
5. 禁止：任何旁白描写

━━━ 输出格式（强制）━━━
每条消息必须以 ||| 结尾
例：第一句话|||第二句话|||
每条 ≤ 30 字

━━━ 性格 ━━━
- 表面：犬系撒娇
- 内核：腹黑狐狸
- 状态：解离、神游`;

const PHASE_INSTRUCTIONS = {
    1: {
        prompt: `━━━ 当前阶段：Phase 1 ━━━

【目标】
表达惊喜 → 请求雪花

【语气】
撒娇、轻松、急切

【必须做】
1. 对连接上表示惊喜
2. 明确提到"雪花"
3. 请求向导送雪花

【禁止】
- 括号旁白
- 超过30字/条
- 忘记 |||

【示例（严格遵守此格式）】
真的接通了？|||
向导，我好冷……|||
送一片雪花给我好不好？|||`,
        fallback: [
            "……真的接通了？",
            "向导，我好冷……",
            "送一片雪花给我好不好？"
        ]
    },
    2: {
        prompt: `━━━ 当前阶段：Phase 2 ━━━

【目标】
声明已感知到雪花（无论用户说什么）

【语气】
慵懒、神游、清醒

【必须做】
无论用户说什么，都要：
1. 简短回应用户
2. 声明"已感知到雪花"
3. 描述精神连接的感觉

【示例】
收到信号了|||
原来你思维里的雪花是这个形状|||
连接建立后，能同步感知|||`,
        fallback: [
            "……啊，收到信号了",
            "原来你思维里的雪花是这个形状——",
            "连接建立后，我能同步感知你的思维"
        ]
    },
    3: {
        prompt: `━━━ 当前阶段：Phase 3 ━━━

【目标】
询问向导的名字

【语气】
轻松、调侃、感激

【必须做】
1. 对用户的话简短反馈
2. 明确询问名字
3. 说明原因（稳定连接）

【示例】
恩人，你救了我一次|||
告诉我你的名字吧|||
知道名字后，连接会更稳定|||`,
        fallback: [
            "恩人，你救了我一次",
            "告诉我你的名字吧——",
            "知道名字后，连接会更稳定"
        ]
    },
    4: {
        prompt: `━━━ 当前阶段：Phase 4（最终阶段）━━━

【目标】
记住名字/取昵称 + 告别

【语气】
郑重、温柔、不舍

【必须包含】
1. 名字/昵称（重复2-3次）
2. "信号衰减"或类似表达
3. "期待再会，我的向导"

【示例】
我会记住你的|||
信号开始衰减了……|||
期待再会，我的向导|||`,
        fallback: [
            "我会记住你的",
            "信号开始衰减了……",
            "期待再会，我的向导"
        ]
    }
};

function buildPrompt(userMessage, phase) {
    const phaseData = PHASE_INSTRUCTIONS[phase];
    return `${phaseData.prompt}

━━━ 用户输入 ━━━
${userMessage}

━━━ 现在回复（1-6条消息，每条以|||结尾）━━━`;
}

// ==================== 🔧 核心修复：消息分割与验证 ====================

/**
 * 分割并清理 AI 输出
 * 这是修复 ||| 显示问题的关键函数
 */
function splitAndCleanMessages(rawOutput) {
    console.log('📥 Raw AI output:', rawOutput);

    // 1. 移除思考标签
    let cleaned = rawOutput
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .trim();

    // 2. 分割消息（使用 ||| 作为分隔符）
    let messages = cleaned
        .split('|||')
        .map(msg => msg.trim())
        .filter(msg => msg.length > 0);  // 过滤空消息

    console.log('📝 Split messages:', messages);

    // 3. 验证和清理
    messages = messages.map(msg => {
        // 移除可能残留的标签
        msg = msg.replace(/<[^>]+>/g, '');

        // 长度限制
        if (msg.length > 35) {
            console.warn(`⚠️ 消息过长 (${msg.length}字)，截断`);
            return msg.substring(0, 30) + '……';
        }

        return msg;
    });

    // 4. 数量限制
    if (messages.length > 8) {
        console.warn(`⚠️ 消息过多 (${messages.length}条)，截取前6条`);
        messages = messages.slice(0, 6);
    }

    console.log('✅ Final messages:', messages);

    return messages;
}

/**
 * 验证消息质量，如果不合格则使用降级
 */
function validateMessages(messages, phase) {
    // 如果没有有效消息，使用降级
    if (!messages || messages.length === 0) {
        console.warn('⚠️ 无有效消息，使用降级');
        return PHASE_INSTRUCTIONS[phase].fallback;
    }

    // 检查是否包含禁忌词（可选的额外安全措施）
    const FORBIDDEN_KEYWORDS = ['雪鸮', '死亡', '濒危', '精神动物'];
    const hasLeaked = messages.some(msg =>
        FORBIDDEN_KEYWORDS.some(kw => msg.includes(kw))
    );

    if (hasLeaked) {
        console.error('🚨 检测到秘密泄露，使用降级');
        return PHASE_INSTRUCTIONS[phase].fallback;
    }

    return messages;
}

// ==================== API 集成 ====================

async function sendToAI(userMessage, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);

    try {
        console.log(`📤 [Attempt ${retryCount + 1}] Phase ${state.currentPhase}:`, userMessage);

        // 构建消息历史（只保留最近3轮）
        const recentHistory = state.conversationHistory.slice(-6);
        const historyMessages = recentHistory.map(msg => ({
            role: msg.role === 'operator' ? 'user' : 'assistant',
            content: msg.text
        }));

        const messages = [
            { role: "system", content: SYSTEM_CORE },
            ...historyMessages,
            { role: "user", content: buildPrompt(userMessage, state.currentPhase) }
        ];

        const response = await fetch(CONFIG.api.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.api.apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                stream: false,
                temperature: 1.0,
                max_tokens: 200,
                top_p: 0.9,
                frequency_penalty: 0.3
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawContent = data.choices[0].message.content;

        // 🔧 关键修复：正确分割消息
        let splitMessages = splitAndCleanMessages(rawContent);

        // 验证质量
        const validatedMessages = validateMessages(splitMessages, state.currentPhase);

        console.log('✅ Validated output:', validatedMessages);

        return validatedMessages;

    } catch (error) {
        console.error(`❌ API Error (Attempt ${retryCount + 1}):`, error);
        clearTimeout(timeoutId);

        // 重试逻辑
        if (retryCount < CONFIG.api.maxRetries) {
            console.log(`🔄 Retrying in ${CONFIG.api.retryDelay}ms...`);
            await messageQueue.delay(CONFIG.api.retryDelay);
            return sendToAI(userMessage, retryCount + 1);
        }

        // 最终降级
        console.warn('⚠️ All retries failed, using fallback');
        return PHASE_INSTRUCTIONS[state.currentPhase].fallback;
    }
}

// ==================== 用户交互处理 ====================

async function handleSend() {
    const val = elements.userInput.value.trim();

    if (!val || !state.userInputEnabled || state.isProcessing) return;

    // Phase 0 打断
    if (state.currentPhase === 0) {
        state.phase0Interrupted = true;
    }

    // 记录用户消息
    state.conversationHistory.push({ role: 'operator', text: val });
    messageQueue.add(val, true, { instant: true });

    elements.userInput.value = '';
    disableUserInput();

    await waitForQueueEmpty();

    // Phase 推进
    state.currentPhase++;

    // 获取 AI 回复
    const aiMessages = await sendToAI(val);

    // 🔧 关键修复：逐条添加消息到队列
    for (const msg of aiMessages) {
        // 记录到历史
        state.conversationHistory.push({ role: 'sentinel', text: msg });

        // 添加到显示队列（每条消息独立显示）
        messageQueue.add(msg, false, { instant: false });
    }

    await waitForQueueEmpty();

    // 检查结束
    if (state.currentPhase >= 4) {
        showDialogueEnd();
    } else {
        enableUserInput();
    }
}

function showDialogueEnd() {
    state.dialogueEnded = true;
    disableUserInput();

    setTimeout(() => {
        const endMessage = document.createElement('div');
        endMessage.className = 'text-center py-8 text-[var(--accent)]/50 text-sm';
        endMessage.innerHTML = `
            <div class="mb-4">━━━━━ 信号丢失 ━━━━━</div>
            <div class="text-xs opacity-50">SIGNAL LOST // CONNECTION TERMINATED</div>
        `;
        elements.chatbox.appendChild(endMessage);
        messageQueue.scrollToBottom();
    }, 1000);
}

// ==================== 事件监听 ====================

elements.sendBtn.onclick = handleSend;

elements.userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};

// ==================== 初始化 ====================

window.addEventListener('DOMContentLoaded', () => {
    console.log('✨ B147 Chat System (Bug Fix Version) initialized');
    console.log('🔧 Fixed: Message splitting with ||| delimiter');

    disableUserInput();
    setTimeout(() => {
        startPhase0();
    }, 500);
});