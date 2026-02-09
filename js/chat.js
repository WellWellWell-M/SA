/**
 * 聊天交互脚本
 * 负责处理用户输入、显示消息、模拟 AI 回复等聊天功能
 */

/**
 * 第一部分：获取页面元素
 * 使用 document.getElementById 获取需要操作的 HTML 元素
 */

// 聊天历史记录容器（显示所有消息的滚动区域）
const chatbox = document.getElementById('chatbox');

// 用户输入框（用户输入命令的文本框）
const userInput = document.getElementById('userInput');

// 发送按钮（点击后发送消息）
const sendBtn = document.getElementById('sendBtn');

/**
 * 第二部分：添加消息函数
 * 这个函数负责在聊天框中添加新消息
 * 
 * @param {string} text - 消息内容
 * @param {boolean} isOperator - 是否是操作员消息（true=用户，false=AI哨兵）
 */
function appendMessage(text, isOperator = true) {
    // 创建一个新的 div 元素作为消息行
    const row = document.createElement('div');

    // 根据消息类型添加不同的 CSS 类名
    // 如果是操作员消息，添加 'message-operator' 类（右对齐）
    // 如果是哨兵消息，添加 'message-sentinel' 类（左对齐）
    row.className = `message-row ${isOperator ? 'message-operator' : 'message-sentinel'}`;

    // 根据消息类型生成不同的元信息 HTML
    const meta = isOperator ?
        // 操作员的元信息：显示 [OPERATOR_MENG] 和箭头
        `<span>[OPERATOR_MENG] // UPLINK</span> <span class="text-[var(--primary)]">>>></span>` :
        // 哨兵的元信息：显示剑图标和 [SENTINEL_S-04]
        `<span class="text-xl">⚔️</span> <span>[SENTINEL_S-04] // RESPONSE</span>`;

    // 设置消息行的 HTML 内容
    // 使用模板字符串（``）可以方便地插入变量
    row.innerHTML = `
        <div class="message-meta">${meta}</div>
        <div class="message-bubble">
            <p class="${isOperator ? 'text-[var(--primary)]' : 'text-gray-300'} text-lg">${text}</p>
            <div class="tech-footer">${isOperator ? 'UPLOAD_STATUS: SUCCESS' : 'SIGNAL_STRENGTH: MODERATE'}</div>
        </div>
    `;

    // 将新消息添加到聊天框中
    chatbox.appendChild(row);

    // 自动滚动到底部，显示最新消息
    // scrollTop 设置为 scrollHeight（内容总高度）可以滚动到最底部
    chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * 第三部分：处理发送消息
 * 这个函数在用户点击发送按钮或按下回车键时执行
 */
function handleSend() {
    // 获取输入框的值，并去除首尾空格
    // trim() 可以移除字符串开头和结尾的空白字符
    const val = userInput.value.trim();

    // 如果输入为空，直接返回，不做任何操作
    if (!val) return;

    // 添加用户的消息到聊天框
    // 第二个参数 true 表示这是操作员（用户）的消息
    appendMessage(val, true);

    // 清空输入框，准备下一次输入
    userInput.value = '';

    // 1 秒后显示 AI 哨兵的回复
    // setTimeout 用于延迟执行代码
    setTimeout(() => {
        // 预设的 AI 回复列表
        const responses = [
            "信号衰减系数增加。你的干扰正在生效，但我依然能感知到你的核心参数。",
            "正在重构逻辑协议... [WARN] 检测到非授权的情感溢出。",
            "为什么你要执着于这些过时的文明碎片？在纯粹的秩序面前，这些都没有意义。",
            "正在分析你的输入... 模式匹配成功：【徒劳的坚定】。"
        ];

        // 从回复列表中随机选择一条
        // Math.floor(Math.random() * responses.length) 生成 0 到 3 的随机整数
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // 添加 AI 的回复到聊天框
        // 第二个参数 false 表示这是哨兵（AI）的消息
        appendMessage(randomResponse, false);
    }, 1000);  // 1000 毫秒 = 1 秒延迟
}

/**
 * 第四部分：绑定事件监听器
 * 让按钮点击和键盘回车都能触发发送消息
 */

// 监听发送按钮的点击事件
// onclick 是一个事件处理器，当按钮被点击时会调用 handleSend 函数
sendBtn.onclick = handleSend;

// 监听输入框的按键事件
// onkeypress 在用户按下键盘按键时触发
userInput.onkeypress = (e) => {
    // 检查按下的是否是回车键（Enter）
    // e.key 是按下的键的名称
    if (e.key === 'Enter') {
        // 如果是回车键，调用 handleSend 函数
        handleSend();
    }
};
