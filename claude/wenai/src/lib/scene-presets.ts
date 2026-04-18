/**
 * AI 主图场景预设 · 对标 HotClaw 的"场景智能融合"
 * 5 品类 × 3 预设 = 15 个开箱即用场景
 * 比 HotClaw 通用模板更垂直
 */

export interface ScenePreset {
  id: string;
  label: string;
  description: string;
  mood: string; // 视觉情绪一句话
}

export const SCENE_PRESETS: Record<string, ScenePreset[]> = {
  home: [
    { id: 'home-kitchen', label: '厨房台面', description: '白色台面 + 晨光 + 极简北欧', mood: '干净、治愈、Pinterest 风' },
    { id: 'home-pantry', label: '食品储藏室', description: '整齐货架 + 标签 + 暖光', mood: '有条理、收纳控最爱' },
    { id: 'home-living', label: '客厅桌面', description: '胡桃木桌 + 多肉 + 咖啡杯', mood: '生活气息、质感' },
  ],
  auto: [
    { id: 'auto-dashboard', label: '车载仪表台', description: '现代轿车仪表台 + 晚霞', mood: '科技感、动感' },
    { id: 'auto-steering', label: '方向盘视角', description: '皮质内饰 + 中心构图', mood: '驾驶员视角、沉浸' },
    { id: 'auto-detail', label: '产品细节', description: '微距 + 机械结构 + 浅景深', mood: '工程美学' },
  ],
  digital: [
    { id: 'digital-desk', label: '极简桌面', description: 'MacBook + 笔记本 + 窗光', mood: '程序员 / 创作者日常' },
    { id: 'digital-outdoor', label: '户外挂饰', description: '背包带 + 徒步背景 + 黄金光', mood: '户外、耐用' },
    { id: 'digital-detail', label: '影棚产品', description: '渐变背景 + 45°主光', mood: '科技媒体评测感' },
  ],
  tool: [
    { id: 'tool-workshop', label: '工坊工作台', description: '木屑 + 钨丝灯 + 工匠感', mood: 'DIY / 匠人氛围' },
    { id: 'tool-hand', label: '手持使用', description: '实际握持 + 使用瞬间', mood: '真实场景' },
    { id: 'tool-kit', label: '平铺全家福', description: '附件排开 + 俯视 + 影棚光', mood: '包装开箱感' },
  ],
  living: [
    { id: 'living-bathroom', label: '浴室台面', description: '大理石 + 晨光 + 酒店感', mood: '干净、精致' },
    { id: 'living-kitchen', label: '厨房岛台', description: '新鲜食材 + 自然光', mood: '食品杂志感' },
    { id: 'living-outdoor', label: '户外野餐', description: '野餐布 + 零食 + 草地', mood: '惬意、生活方式' },
  ],
};

export function getScenePresets(category: string): ScenePreset[] {
  return SCENE_PRESETS[category] || [];
}
