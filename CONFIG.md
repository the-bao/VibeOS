# VibeOS MVP Configuration

## API Configuration

### Method 1: Environment Variables (Recommended)

```bash
# 标准配置 - 使用 Anthropic 官方 API
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# 自定义API端点 - 使用代理或中转服务
export ANTHROPIC_API_KEY="your-api-key"
export ANTHROPIC_BASE_URL="https://your-proxy.com/v1"
```

### Method 2: Code Configuration

```typescript
import { LLMClient } from './llm/client.js';

// 使用默认端点 (api.anthropic.com)
const client1 = new LLMClient('your-api-key');

// 使用自定义端点
const client2 = new LLMClient({
  apiKey: 'your-api-key',
  baseURL: 'https://your-proxy.com/v1',
  timeout: 120000  // 2分钟超时
});
```

## 常见使用场景

### 场景 1: 使用国内中转API

```bash
# 设置为中转API地址
export ANTHROPIC_BASE_URL="https://api.example.com/v1"
export ANTHROPIC_API_KEY="your-proxy-key"

# 运行
npm run dev reconcile --manifest templates/snake-game.json
```

### 场景 2: 使用本地代理

```bash
# 如果你有本地代理服务
export ANTHROPIC_BASE_URL="http://localhost:8080/v1"
export ANTHROPIC_API_KEY="any-key"
```

### 场景 3: 使用第三方兼容服务

```bash
# 使用兼容 OpenAI/Claude 格式的API
export ANTHROPIC_BASE_URL="https://third-party-api.com/v1"
export ANTHROPIC_API_KEY="third-party-key"
```

## 配置文件 .env

创建 `.env` 文件（确保添加到 .gitignore）：

```bash
# API Configuration
ANTHROPIC_API_KEY=sk-ant-xxxxx
ANTHROPIC_BASE_URL=https://api.example.com/v1

# Optional: Model override
# DEFAULT_MODEL=claude-3-5-sonnet-20241022
```

使用方式：

```bash
# 加载 .env 文件
export $(cat .env | xargs)

# 或使用 dotenv 包（需要安装依赖）
npm install dotenv
```

## 验证配置

```bash
# 查看当前配置
echo $ANTHROPIC_API_KEY
echo $ANTHROPIC_BASE_URL

# 测试连接
node -e "
import('./dist/llm/client.js').then(m => {
  const client = new m.LLMClient({
    apiKey: 'test',
    baseURL: process.env.ANTHROPIC_BASE_URL
  });
  console.log('API端点配置成功');
});
"
```

## 注意事项

1. **兼容性**: 自定义端点必须兼容 Anthropic API 格式
2. **安全性**: 不要将 API key 提交到代码仓库
3. **稳定性**: 确保中转服务稳定可靠
4. **成本**: 注意中转服务的定价差异
