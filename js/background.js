/**
 * 背景动画脚本
 * 负责生成和动画化背景的采样点（小圆点）
 * 创建一种动态的、科技感的背景效果
 */

/**
 * 第一部分：生成背景采样点
 * 在页面加载时创建 50 个随机分布的小圆点
 */

// 获取采样点容器元素（在 HTML 中 id="dots" 的 div）
const container = document.getElementById('dots');

// 循环创建 50 个采样点
for (let i = 0; i < 50; i++) {
    // 创建一个新的 div 元素作为采样点
    const dot = document.createElement('div');

    // 给这个 div 添加 'dot' 类名，应用 CSS 样式
    dot.className = 'dot';

    // 设置随机的水平位置（0% 到 100% 之间）
    // Math.random() 生成 0-1 之间的随机数，乘以 100 得到百分比
    dot.style.left = Math.random() * 100 + '%';

    // 设置随机的垂直位置（0% 到 100% 之间）
    dot.style.top = Math.random() * 100 + '%';

    // 将这个采样点添加到容器中，显示在页面上
    container.appendChild(dot);
}

/**
 * 第二部分：采样点动画
 * 使用 requestAnimationFrame 创建高性能的动画循环
 * 定期让随机的采样点闪烁，模拟信号活动
 */

// 记录上次动画执行的时间戳
let lastDotTime = 0;

/**
 * 动画函数
 * @param {number} timestamp - 当前时间戳（由浏览器自动提供）
 */
function animateDots(timestamp) {
    // 检查是否已经过了 800 毫秒（0.8 秒）
    // 这样可以控制动画不会执行得太频繁
    if (timestamp - lastDotTime > 800) {

        // 获取页面上所有的采样点
        const dots = document.querySelectorAll('.dot');

        // 确保至少有一个采样点存在
        if (dots.length > 0) {
            // 随机选择一个采样点
            // Math.floor() 向下取整，Math.random() * dots.length 生成 0 到 dots.length-1 的随机索引
            const target = dots[Math.floor(Math.random() * dots.length)];

            // 让选中的采样点变亮（不透明度从 0.15 增加到 0.6）
            target.style.opacity = '0.6';

            // 让选中的采样点变大（缩放到 1.5 倍）
            target.style.transform = 'scale(1.5)';

            // 添加平滑过渡效果（0.3 秒的缓动）
            target.style.transition = 'all 0.3s ease';

            // 1 秒后恢复采样点的原始状态
            setTimeout(() => {
                // 恢复原始不透明度
                target.style.opacity = '0.15';

                // 恢复原始大小
                target.style.transform = 'scale(1)';
            }, 1000);  // 1000 毫秒 = 1 秒
        }

        // 更新上次执行时间
        lastDotTime = timestamp;
    }

    // 请求下一帧动画
    // 这会让浏览器在下次重绘前再次调用 animateDots 函数
    // 形成一个持续的动画循环
    requestAnimationFrame(animateDots);
}

// 启动动画循环
// 第一次调用 animateDots，之后它会自己持续调用
requestAnimationFrame(animateDots);
