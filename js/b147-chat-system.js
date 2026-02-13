/**
 * B147 AI Chat System
 * 实现哨兵 B147 的对话系统，包括 Phase 0 自动播放、打字机效果、API 集成
 */

// ==================== 配置 ====================

const CONFIG = {
    // 打字机效果配置
    typewriter: {
        charDelay: 60,           // 每个字符延迟（毫秒）
        punctuationDelay: 200,   // 标点符号后额外延迟（毫秒）
        messageGap: 800,         // 消息之间的间隔（毫秒）
        punctuationMarks: ['。', '，', '！', '？', '…', '.', ',', '!', '?', ':', '：', '——', '—']
    },

    // Phase 0 预设消息
    phase0Messages: [
        { text: "哨兵B147，请求与向导连接。", instant: true },
        { text: "重复：哨兵B147，请求与向导连接。", delay: 3000 },
        { text: "……有人吗？", delay: 3000 },
        { text: "有人吗有人吗有人吗，理我一下求求你求求你求求你 ˃̣̣̥ ˂̣̣̥", delay: 3000 }
    ],

    // API 配置 (DeepSeek)
    api: {
        endpoint: 'https://api.deepseek.com/chat/completions',  // DeepSeek API
        apiKey: 'sk-3f2f2f9b165f41819ff9f9a1857cefca',
        timeout: 30000          // 超时时间（毫秒）
    }
};

// ==================== 全局状态 ====================

const state = {
    currentPhase: 0,              // 当前对话阶段
    conversationHistory: [],      // 对话历史
    userInputEnabled: false,      // 是否允许用户输入
    dialogueEnded: false,         // 对话是否结束
    isProcessing: false,          // 是否正在处理消息
    phase0Interrupted: false      // Phase 0 是否被打断
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

    /**
     * 添加消息到队列
     * @param {string} text - 消息文本
     * @param {boolean} isOperator - 是否是操作员消息
     * @param {object} options - 选项（instant: 是否立即显示）
     */
    add(text, isOperator = false, options = {}) {
        // 如果没有显式指定 instant，向导消息(operator)默认为 true，哨兵消息默认为 false
        const finalOptions = {
            instant: isOperator,
            ...options
        };
        this.queue.push({ text, isOperator, options: finalOptions });
        if (!this.isProcessing) {
            this.process();
        }
    }

    /**
     * 处理队列中的消息
     */
    async process() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            state.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        state.isProcessing = true;

        const { text, isOperator, options } = this.queue.shift();

        // 创建消息元素
        const messageElement = this.createMessageElement(text, isOperator);
        elements.chatbox.appendChild(messageElement);

        // 获取消息内容元素
        const contentElement = messageElement.querySelector('p');

        if (options.instant) {
            // 立即显示
            contentElement.textContent = text;
            this.scrollToBottom();

            // 等待消息间隔后处理下一条
            await this.delay(CONFIG.typewriter.messageGap);
            this.process();
        } else {
            // 打字机效果
            await this.typewriterEffect(contentElement, text);
            this.scrollToBottom();

            // 等待消息间隔后处理下一条
            await this.delay(CONFIG.typewriter.messageGap);
            this.process();
        }
    }

    /**
     * 创建消息 DOM 元素
     */
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

    /**
     * 打字机效果
     */
    async typewriterEffect(element, text) {
        element.textContent = '';

        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];

            // 每打几个字就滚动一次，保持内容可见
            if (i % 5 === 0) {
                this.scrollToBottom();
            }

            // 检查是否是标点符号
            const isPunctuation = CONFIG.typewriter.punctuationMarks.includes(text[i]);
            const delay = isPunctuation ?
                CONFIG.typewriter.charDelay + CONFIG.typewriter.punctuationDelay :
                CONFIG.typewriter.charDelay;

            await this.delay(delay);
        }

        // 最后再滚动一次确保完全可见
        this.scrollToBottom();
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
        requestAnimationFrame(() => {
            elements.chatbox.scrollTop = elements.chatbox.scrollHeight;
        });
    }

    /**
     * 清空队列
     */
    clear() {
        this.queue = [];
    }
}

// 创建消息队列实例
const messageQueue = new MessageQueue();

// ==================== Phase 0 自动播放 ====================

async function startPhase0() {
    state.currentPhase = 0;
    state.userInputEnabled = false;

    // 清空聊天框（移除预设消息）
    elements.chatbox.innerHTML = '';

    for (let i = 0; i < CONFIG.phase0Messages.length; i++) {
        // 检查是否被打断
        if (state.phase0Interrupted) {
            console.log('Phase 0 interrupted by user');
            break;
        }

        const msg = CONFIG.phase0Messages[i];

        // 如果不是第一条消息，等待延迟
        if (i > 0 && msg.delay) {
            await messageQueue.delay(msg.delay);
        }

        // 添加消息到队列
        messageQueue.add(msg.text, false, { instant: msg.instant });
    }

    // Phase 0 完成后，启用用户输入
    // 等待所有消息显示完成
    await waitForQueueEmpty();

    if (!state.phase0Interrupted) {
        enableUserInput();
    }
}

/**
 * 等待消息队列处理完成
 */
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

/**
 * 启用用户输入
 */
function enableUserInput() {
    state.userInputEnabled = true;
    // 不再手动设置 currentPhase = 1，让 handleSend 处理推进
    elements.userInput.disabled = false;
    elements.sendBtn.disabled = false;
    // 添加 active 类以改变颜色
    const inputArea = document.querySelector('.terminal-input-area');
    if (inputArea) inputArea.classList.add('input-active');
}

/**
 * 禁用用户输入
 */
function disableUserInput() {
    state.userInputEnabled = false;
    elements.userInput.disabled = true;
    elements.sendBtn.disabled = true;
    // 移除 active 类以恢复原本颜色
    const inputArea = document.querySelector('.terminal-input-area');
    if (inputArea) inputArea.classList.remove('input-active');
}

// ==================== API 集成 (DeepSeek) ====================

// [角色卡] 身份核心 (Identity / Character Card)
const IDENTITY_PROMPT = `
# Character: B147
# Personality: 腹黑狐狸伪装成犬系 / 慵懒 / 神游 / 擅长撒娇与调侃
# Background: 被困在热带海岛（第三岛）的哨兵。
# Description: 你是一个擅长用轻松态度解构沉重现实的“引导型恋人”。你表现出对玩家（向导）的极度依赖，但内心有着清醒且腹黑的一面。你患有严重的解离性创伤，这让你的回复有时显得碎片化、富有文学性的解离感。
`;

// [规则] 禁忌与格式 (Directives & Hard Constraints)
const CORE_RULES = `
## ⚠️ 绝对禁区 (FORBIDDEN / NG-LIST)
- ❌ **绝对禁止透露你的精神动物是雪鸮**。
- ❌ **绝对禁止提及雪鸮即将死亡或虚弱的状态**。
- ❌ **绝对禁止解释为何需要雪花（不要联系到精神动物）**。
- ❌ **绝对禁止提及“哨兵-向导”的技术细节或地理隔离的真相**。
- ❌ **即使玩家问起，也要用调侃或卖乖搪塞过去（例如：单纯因为我喜欢雪啊/为了测试连接稳定性）**。

## 🛠 输出格式 (FORMAT)
1. **纯对话格式**：禁止使用括号文字，如 (轻笑)、(信号音)。禁止任何旁白描写。
2. **消息分隔符**：每条消息末尾必须带 "|||"，总回复控制在 1-8 条。
3. **话题推进**：第一句回应玩家，后续必须转向当前阶段的目标。
`;

// 各阶段特定指令 (Dynamic Injection)
const PHASE_PROMPTS = {
    1: `【当前任务：Phase 1 诱导雪花】
    - 目标：对连线上表示惊喜，并诱导玩家发送“雪花”。
    - 参考：“真的接通了？|||我以为……|||算了，你是真实的对吧？|||那个，向导。|||哪怕只是个奢望……|||送一片雪花给我好不好？”`,

    2: `【当前任务：Phase 2 感知连接】
    - 目标：告知连接已建立。只要玩家脑里闪过雪花，你就能感知到。
    - 参考：“……啊。|||收到了。|||原来你思维里的雪花是这个形状啊。|||凉凉的……|||我就能感知到。|||就像现在，有一片小雪花落在了睫毛上。”`,

    3: `【当前任务：Phase 3 获取标识】
    - 目标：表达感谢，询问玩家名字。
    - 参考：“恩人，你救了我一次。|||现在的精神图景稳定多了。|||对了。|||我还不知道怎么称呼你。|||告诉我你的名字吧——|||亲爱的向导。”`,

    4: `【当前任务：Phase 4 记忆刻录 (告别)】
    - 目标：记住名字（或取昵称），然后郑重告别，提到信号衰减。
    - 最后必须说再见。这是对话的完结。`
};



/**
 * 发送消息到 AI (DeepSeek API)
 */
async function sendToAI(userMessage) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);

    try {
        console.log('📤 Sending to DeepSeek API:', {
            phase: state.currentPhase,
            message: userMessage
        });

        // 动态构建 System Prompt：基础规则 + 当前阶段特定指令
        const currentPhasePrompt = PHASE_PROMPTS[state.currentPhase] || PHASE_PROMPTS[4];

        // 构建消息历史
        const phase0History = CONFIG.phase0Messages.map(msg => ({
            role: 'assistant',
            content: msg.text
        }));

        const messages = [
            { role: "system", content: IDENTITY_PROMPT + CORE_RULES }, // 初始设定
            ...phase0History,
            ...state.conversationHistory.slice(0, -1).map(msg => ({
                role: msg.role === 'operator' ? 'user' : 'assistant',
                content: msg.text
            })),
            // 最终引导：再次强调禁区和阶段目标（酒馆常用的文末加固）
            {
                role: "system",
                content: `### 当前阶段任务：\n${currentPhasePrompt}\n\n### 再次提醒：\n1. 严禁括号描写！直接说话。\n2. 绝对严禁提到“雪鸮”及其死亡！\n3. 必须使用 ||| 分隔符。`
            },
            { role: "user", content: userMessage }
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
                temperature: 1.1,
                max_tokens: 250
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('📥 Received from API:', data);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid DeepSeek response format');
        }

        const content = data.choices[0].message.content;

        // 使用 ||| 分割多条消息
        const splitMessages = content.split('|||').map(m => m.trim()).filter(m => m);

        return splitMessages.length > 0 ? splitMessages : ['（信号接收失败……）'];

    } catch (error) {
        console.error('❌ API Error:', error);

        if (error.name === 'AbortError') {
            return ['连接超时，正在重新建立连接...'];
        }

        // 出错时降级到 Mock 数据
        console.warn('Fallback to mock response');
        return await mockAPIResponse(userMessage);
    }
}

/**
 * Mock API 响应（降级备用）
 */
async function mockAPIResponse(userMessage) {
    // 模拟网络延迟
    await messageQueue.delay(1000);

    const responses = {
        1: [  // Phase 1 responses
            "……………………真的接通了？",
            "之前每天发一百条信息都没人回，还以为又被骗了……",
            "啊！亲爱的向导，可以帮我一个忙吗？",
            "救救我，我的脑子快烧掉了。",
            "向导向导，送一片雪花给我好不好？"
        ],
        2: [  // Phase 2 responses
            "……啊。收到信号了。",
            "原来你思维里的雪花是这个形状——",
            "哈，连接建立之后，",
            "只要你脑子里闪过雪花，我就能同步感知。",
            "好像有一片小小的雪花挂在了睫毛上，",
            "我已经很久没有感受到它了……"
        ],
        3: [  // Phase 3 responses
            "恩人，你救了我一次。",
            "告诉我你的名字吧——",
            "亲爱的恩人啊不，向导。",
            "知道名字之后，",
            "我就能和你建立更稳定的精神连接了。"
        ]
    };

    return responses[state.currentPhase] || ["收到信号。"];
}

// ==================== 用户交互处理 ====================

/**
 * 处理用户发送消息
 */
async function handleSend() {
    const val = elements.userInput.value.trim();

    if (!val || !state.userInputEnabled || state.isProcessing) return;

    // 如果在 Phase 0，打断自动播放
    if (state.currentPhase === 0) {
        state.phase0Interrupted = true;
        // 不清空队列，但确保不重复处理
    }

    // 添加用户消息
    state.conversationHistory.push({ role: 'operator', text: val });
    messageQueue.add(val, true, { instant: true });

    // 清空输入框
    elements.userInput.value = '';

    // 禁用输入（等待 AI 回复）
    disableUserInput();

    // 等待用户消息显示完成
    await waitForQueueEmpty();

    // 检查是否应该进入下一阶段
    state.currentPhase++;

    // 获取 AI 回复
    const aiMessages = await sendToAI(val);

    // 显示 AI 回复
    for (const msg of aiMessages) {
        state.conversationHistory.push({ role: 'sentinel', text: msg });
        messageQueue.add(msg, false, { instant: false });
    }

    // 等待 AI 消息显示完成
    await waitForQueueEmpty();

    // 检查是否对话结束（Phase 4 之后）
    if (state.currentPhase > 4) {
        showDialogueEnd();
    } else {
        // 重新启用用户输入
        enableUserInput();
    }
}

/**
 * 显示对话结束 UI
 */
function showDialogueEnd() {
    state.dialogueEnded = true;
    disableUserInput();

    // 添加结束消息
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

// 发送按钮点击
elements.sendBtn.onclick = handleSend;

// 回车键发送
elements.userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};

// ==================== 初始化 ====================

// 页面加载完成后启动 Phase 0
window.addEventListener('DOMContentLoaded', () => {
    console.log('B147 Chat System initialized');

    // 禁用输入（Phase 0 期间）
    disableUserInput();

    // 延迟 500ms 后启动 Phase 0（让页面完全加载）
    setTimeout(() => {
        startPhase0();
    }, 500);
});
