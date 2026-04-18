/**
 * 品类专属 prompt 前缀
 *
 * 这是 wenai 相对店匠/HotClaw/Mentarc 的核心差异化：
 * 通用 prompt 不贴品类 = 锚点客户反馈 "AI 输出不如义乌 3-5K 员工" 的病因。
 *
 * 来源：锚点客户（1000 人跨境代运营公司）的五大品类矩阵：
 * 家居用品 / 汽摩配件 / 数码电子 / 工具工艺 / 生活百货
 *
 * 使用：/api/ai 路由收到 category 参数时，在 systemContent 前注入对应 prefix
 */

export type CategoryId = 'home' | 'auto' | 'digital' | 'tool' | 'living';

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  labelEn: string;
  icon: string;
  prefix: string;
  exampleSku: string;
  compliance: string[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'home',
    label: '家居用品',
    labelEn: 'Home & Kitchen',
    icon: '🏠',
    prefix: `【品类：家居用品】
关键注意事项：
- 材质认证必须出现：BPA-Free / FDA / LFGB / Prop 65
- 尺寸必须精确到厘米，含外箱尺寸
- 描述偏好场景化："早餐台面" > "收纳盒"
- 洗碗机安全 / 微波炉安全 / 耐温范围 是消费者关心的 Top3
- 目标用户多为 30-45 岁女性，Pinterest 风格
- 避免: 过度技术参数堆砌`,
    exampleSku: `可叠加密封收纳盒套装（6件装）
BPA-free食品级PP，四侧卡扣密封，3种规格(0.5L/1.2L/2.5L)
可叠放节省40%空间，洗碗机安全，含20张标签+粉笔笔
目标市场：美国 Amazon`,
    compliance: ['FDA 21 CFR', 'BPA-Free 声明', 'Prop 65', 'LFGB（欧盟）'],
  },
  {
    id: 'auto',
    label: '汽摩配件',
    labelEn: 'Automotive',
    icon: '🚗',
    prefix: `【品类：汽摩配件】
关键注意事项：
- 兼容车型必须列出（年款+品牌+型号），宁精勿多
- 安装难度标注：工具清单 + 所需时间
- 耐温范围必须标注：-40°C 到 80°C 是基线
- FCC Part 15 / CE / RoHS 认证（含电子元件时强制）
- 避免 "Compatible with iPhone" 这类商标近似词，改用通用描述
- 目标用户男性，参数导向
- 避免: 过度情感化文案`,
    exampleSku: `军工级磁吸车载手机支架
N52钕磁铁6磁阵列1500g吸力，三合一安装(吸盘/粘贴/出风口)
360°球关节+180°臂旋转，耐温-40°C~80°C
兼容4-7寸手机，含MagSafe`,
    compliance: ['FCC Part 15', 'CE Mark', 'RoHS', 'SAE J1455（车规）'],
  },
  {
    id: 'digital',
    label: '数码电子',
    labelEn: 'Electronics',
    icon: '🔌',
    prefix: `【品类：数码电子】
关键注意事项：
- FCC Part 15 / UL 62368-1 / CE RED / RoHS / WEEE 是欧美标配
- 参数精确到单位：功率 W / 电池 mAh / 蓝牙 5.3 / IP 等级
- 严禁使用苹果商标近似词: AirPods/AirPod/Pods Style 全部换为 "wireless earbuds"
- "XX Compatible" 改为 "Works with iOS and Android"
- 续航/充电时间/防水等级 = 详情页 Top3 决策点
- 目标用户 18-35 岁，技术参数 + 颜值双驱`,
    exampleSku: `户外防水蓝牙音箱 Micro 2
IP67防水防尘(1m/30min)，2×5W全频喇叭+被动振膜
XBass DSP低频增强9dB，12h续航，蓝牙5.3/33ft
USB-C快充，自行车绑带，TWS双机配对`,
    compliance: ['FCC Part 15', 'UL 62368-1', 'CE RED', 'RoHS', 'WEEE 注册号'],
  },
  {
    id: 'tool',
    label: '工具工艺',
    labelEn: 'Tools & Hardware',
    icon: '🔧',
    prefix: `【品类：工具工艺】
关键注意事项：
- 精度指标必须给范围（读数精度 ±0.5% / 测量范围）
- 安全等级：CAT III 600V / CAT IV / IP 等级 必须显眼
- UL / CE LVD / EMC / IEC 61010-1 是行业门槛
- 耐用性证据优先于描述：金属外壳 / 摔落测试 / 防尘防水
- 对比竞品（Fluke/Klein）是合法的价值锚点
- 目标用户 DIY 爱好者 + 专业电工，专业术语准确`,
    exampleSku: `自动量程数字万用表（6000计数）
真有效值TRMS，6000计数背光显示，自动量程 V/A/Ω/F/Hz/°C
NCV非接触电压检测(声光报警)，CAT III 600V 安全等级(IEC 61010-1)
连续性蜂鸣器<25ms响应，含热电偶探头+收纳包`,
    compliance: ['UL 61010-1', 'FCC Part 15B', 'CE LVD', 'EMC 指令', 'IEC 61010-1'],
  },
  {
    id: 'living',
    label: '生活百货',
    labelEn: 'Living',
    icon: '☕',
    prefix: `【品类：生活百货】
关键注意事项：
- 材质证书：BPA-Free / FDA / EU 1935/2004 / REACH
- 保温/保冷性能必须给测试数字（48h保冷，24h保温）
- 容量必须给 oz 和 ml 双单位
- 清洗方式：洗碗机 / 手洗 / 高温消毒 = 必答
- 防漏测试（15 PSI / 水压测试）= 信任锚点
- 目标用户全年龄，偏好亲切口吻+真实场景
- 避免: 过度医疗声明（避免 FDA warning letter）`,
    exampleSku: `三层真空不锈钢保温杯（32oz）
三层真空隔热(保冷48h/保温24h)，18/8食品级304不锈钢
2.2寸大口径放冰块，360°防漏盖(15PSI压力测试)
BPA-free，适配标准车载杯架`,
    compliance: ['FDA 21 CFR', 'Prop 65', 'EU 1935/2004', 'REACH', 'SNI（印尼）'],
  },
];

export function getCategoryPrefix(id: string | undefined | null): string {
  if (!id) return '';
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.prefix : '';
}

export function getCategoryLabel(id: string | undefined | null): string {
  if (!id) return '';
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? `${cat.icon} ${cat.label}` : '';
}

export function getCategoryById(id: string): CategoryConfig | undefined {
  return CATEGORIES.find(c => c.id === id);
}
