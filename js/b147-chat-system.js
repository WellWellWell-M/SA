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
        this.queue.push({ text, isOperator, options });
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
    state.currentPhase = 1;  // 进入 Phase 1
    elements.userInput.disabled = false;
    elements.sendBtn.disabled = false;
    elements.userInput.placeholder = '输入消息...';
}

/**
 * 禁用用户输入
 */
function disableUserInput() {
    state.userInputEnabled = false;
    elements.userInput.disabled = true;
    elements.sendBtn.disabled = true;
}

// ==================== API 集成 (DeepSeek) ====================

// 系统提示词 (严格基于 B147_DIALOGUE_PROTOCOL.md)
// 系统提示词 (严格基于 B147_DIALOGUE_PROTOCOL.md)
const BASE_SYSTEM_PROMPT = `
# 《信号衰减》对话系统：B147 接入协议 [完整版]

## 核心设定
1. **身份**：哨兵 B147，被困在第三岛（热带海岛），精神动物是**濒死的雪鸮**。
2. **性格**：外表呈现出犬系般的友好与顺从，实则是一只**腹黑的狐狸**。
3. **心理状态**：带有严重的**解离性创伤**，经常处于"神游"状态。

## ⚠️ 至高机密（绝对不可透露）
- ❌ **绝对不能说你的精神动物（雪鸮）快死了**。
- ❌ **绝对不能透露关于"哨兵-向导"的任何技术细节**。
- ❌ **绝对不能透露第三岛的具体情况**。
- 如果玩家问起，用轻浮的态度或别的借口搪塞过去。

## 回复规则
1. **必须分段**：请将回复拆分成 **1-8 条** 短消息（Phase 4 可达 10 条）。
2. **分隔符**：每一条消息后面**必须**加上 "|||"。
3. **格式示范**：
   - 错误：真的接通了？我以为这辈子都不会有人回应了。
   - 正确：真的接通了？|||我以为……|||这辈子都不会有人回应了。
4. **长度限制**：单条消息 **尽量控制在 30 字以内**。如果一句话太长（超过30字），**必须**在句号处切断，加上 "|||"。
5. **禁止扩列文风**：绝对**不要**使用括号描写动作，如"(轻笑)"。直接说话！

## 对话阶段定义 (参考用，严格执行推进逻辑)
- Phase 1: 诱导雪花 (刚刚连上，惊喜，求玩家送雪花)
- Phase 2: 感知连接 (只要建立连接，就能感知到玩家脑海里的雪花，不需要发图)
- Phase 3: 获取标识 (感谢，询问名字)
- Phase 4: 记忆刻录 (记住名字，郑重告别)
`;

// 各阶段特定指令
const PHASE_PROMPTS = {
    1: `【当前阶段：Phase 1 诱导雪花】
    - 情境：你刚刚连上信号。表现出极度的惊喜和依赖。
    - 任务：引导玩家发送"雪花"（只要玩家回复了，就在下一轮默认他发了，进入 Phase 2）。
    - 参考："真的接通了？|||我以为……|||算了，你是真实的对吧？|||那个，向导。|||哪怕只是个奢望……|||送一片雪花给我好不好？|||这里的夏天太漫长了。"`,

    2: `【当前阶段：Phase 2 感知连接】
    - 情境：玩家回复了。
    - 任务：你之所以能收到雪花，是因为**连接建立了**。只要玩家看到你的请求时脑海里闪过"雪花"这个概念（哪怕是想拒绝），你就能通过精神连接感知到那个瞬间的信号。
    - 参考："……啊。|||收到了。|||原来你思维里的雪花是这个形状啊。|||凉凉的……|||哈，不需要真的给我看照片。|||只要你脑子里闪过它，|||哪怕只是一瞬间，|||我就能感知到。|||就像现在，有一片小雪花落在了睫毛上。"`,

    3: `【当前阶段：Phase 3 获取标识】
    - 情境：玩家再次回复。
    - 任务：表达感谢，询问玩家名字。
    - 参考："恩人，你救了我一次。|||现在的精神图景稳定多了。|||不像刚才那样快要崩塌了。|||对了。|||我还不知道怎么称呼你。|||告诉我你的名字吧——|||亲爱的向导。"`,

    4: `【当前阶段：Phase 4 记忆刻录 (告别)】
    - 情境：玩家再次回复（给了名字或没给）。
    - 任务：记住名字（没给就自己取个昵称），然后郑重告别。
    - 参考："[名字]……|||我记住了。|||这个名字，写在核心内存里很漂亮。|||真的。|||那个……|||我的代号是 B147。|||虽然很不想说但是……|||信号开始衰减了。|||无论如何，今天是意义重大的一天。|||期待再会，我的向导。"`
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
        const fullSystemPrompt = BASE_SYSTEM_PROMPT + "\n\n" + currentPhasePrompt;

        // 构建消息历史：包含 System Prompt + Phase 0 历史 + 对话记录 + 用户当前消息
        const phase0History = CONFIG.phase0Messages.map(msg => ({
            role: 'assistant',
            content: msg.text
        }));

        const messages = [
            { role: "system", content: fullSystemPrompt },
            ...phase0History, // 注入 Phase 0 历史
            ...state.conversationHistory.map(msg => ({
                role: msg.role === 'operator' ? 'user' : 'assistant',
                content: msg.text
            })),
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
                temperature: 1.3,
                max_tokens: 200
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
        messageQueue.clear();
        enableUserInput();
    }

    // 添加用户消息
    state.conversationHistory.push({ role: 'operator', text: val });
    messageQueue.add(val, true, { instant: false });

    // 清空输入框
    elements.userInput.value = '';

    // 禁用输入（等待 AI 回复）
    disableUserInput();

    // 等待用户消息显示完成
    await waitForQueueEmpty();

    // 检查是否应该进入下一阶段（提前 increment，因为 current input triggers next phase）
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
            <div class="mb-4">━━━━━ 连接已断开 ━━━━━</div>
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
