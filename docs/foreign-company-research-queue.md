# Foreign Company Research Queue

## 1. 使用原则

- 每次只处理一个公司或人物。不要一次处理多个。
- 每个目标都必须 English-first research — 优先搜索英文公开资料。
- 最终报告用中文表达，但 sources 保留英文原始链接。
- 不要只依赖中文资料。
- 每个目标先跑 `node scripts/gtm-check.js data/gtm/{brand-slug}.json`，再 `--publish`。
- 本地检查通过后再 push。
- 如果报告变短，优先补 JSON 和 prompt，不要改代码。
- 不要做爬虫、不要接 API、不要创建 package.json、不要重构项目。
- 对不确定内容写 `unknown` / `not_found` / `not_found_or_not_core` / `low_confidence`。

## 2. P0 优先级

### 2.1 NVIDIA
- 类型：company / semiconductor / AI infrastructure
- 为什么研究：AI 时代核心基础设施公司，CUDA 生态护城河是经典平台锁定案例，从游戏 GPU 转型数据中心 AI 的路径极具学习价值。
- 首选英文资料关键词：NVIDIA founder story, CUDA ecosystem, NVIDIA data center business model, NVIDIA GTC keynote history, NVIDIA investor presentation, NVIDIA annual report, NVIDIA AI ecosystem, NVIDIA CUDA moat
- 建议 top_products：GeForce GPU product line, CUDA platform, DGX / Data Center AI (H100-Blackwell)

### 2.2 Oura
- 类型：company / health hardware / wearable / DTC
- 为什么研究：健康戒指品类开创者，订阅+硬件双收入模型，从众筹到全球健康平台的路径值得深挖。
- 首选英文资料关键词：Oura Ring founder story, Oura business model subscription, Oura valuation funding, Oura health platform, Oura clinical studies
- 建议 top_products：Oura Ring Gen 3, Oura Ring Gen 4

### 2.3 WHOOP
- 类型：company / health hardware / wearable / B2B
- 为什么研究：纯订阅硬件模式标杆，从专业运动员市场切入消费级，B2B 企业健康市场扩展路径独特。
- 首选英文资料关键词：WHOOP founder story, WHOOP subscription model, WHOOP valuation, WHOOP pro athlete strategy, WHOOP enterprise
- 建议 top_products：WHOOP 4.0, WHOOP Coach AI

### 2.4 Eight Sleep
- 类型：company / health hardware / sleep tech / DTC
- 为什么研究：高价睡眠科技硬件订阅模式，Pod 系列产品迭代路径清晰，从 DTC 到 Formula 1 合作的高端品牌建设。
- 首选英文资料关键词：Eight Sleep founder story, Eight Sleep Pod technology, Eight Sleep subscription, Eight Sleep funding, Eight Sleep F1 partnership
- 建议 top_products：Pod 4 Ultra, Pod 3

### 2.5 Tonal
- 类型：company / fitness hardware / subscription / DTC
- 为什么研究：智能力量训练硬件标杆，$1.6B 峰值估值到 $550M 的估值调整，高端健身硬件的定价和渠道教训。
- 首选英文资料关键词：Tonal founder story, Tonal valuation down round, Tonal business model, Tonal retail expansion, Tonal technology
- 建议 top_products：Tonal Trainer

### 2.6 Peloton
- 类型：company / fitness hardware / subscription / DTC + retail
- 为什么研究：互联健身品类定义者，$50B→$1.2B 市值的完整周期，从爆发到回调的全渠道教训。
- 首选英文资料关键词：Peloton post-pandemic strategy, Peloton subscription churn, Peloton retail partnership, Peloton turnaround
- 建议 top_products：Peloton Bike, Peloton Tread

### 2.7 Garmin
- 类型：company / fitness hardware / wearable / outdoor
- 为什么研究：老牌 GPS 硬件公司成功转型健康可穿戴，多产品线策略（航空、航海、户外、健身），渠道覆盖全球。
- 首选英文资料关键词：Garmin business model, Garmin product segments, Garmin fitness market share, Garmin annual report, Garmin aviation marine
- 建议 top_products：Garmin Forerunner, Garmin Fenix

### 2.8 GoPro
- 类型：company / action camera / DTC + retail
- 为什么研究：品类开创者，从爆发到被智能手机挤压再到订阅转型的完整周期，硬件公司订阅化的经典案例。
- 首选英文资料关键词：GoPro subscription revenue, GoPro turnaround, GoPro retail strategy, GoPro competition smartphone
- 建议 top_products：GoPro HERO, GoPro MAX

### 2.9 Framework
- 类型：company / modular laptop / DTC / repairability
- 为什么研究：模块化消费电子新范式，可维修性优先的产品哲学，开源生态+社区驱动模式的商业可行性测试。
- 首选英文资料关键词：Framework laptop business model, Framework modular ecosystem, Framework funding, Framework repairability, Framework community
- 建议 top_products：Framework Laptop 13, Framework Laptop 16

### 2.10 Formlabs
- 类型：company / 3D printing / prosumer / dental
- 为什么研究：从 Kickstarter 到专业牙科市场的垂直化路径，SLA/SLS 技术消费化的商业模型。
- 首选英文资料关键词：Formlabs founder story, Formlabs dental business, Formlabs Kickstarter, Formlabs business model, Formlabs valuation
- 建议 top_products：Form 4, Fuse 1

## 3. P1 智能硬件 / DTC / 线下渠道

- Dyson — company / home appliance / engineering-driven / UK. 为什么研究：工程驱动型品牌建设、高价策略、线下体验店模式。建议产品：Dyson Airblade, Dyson V15 Detect, Dyson Airwrap。
- Sonos — company / audio / smart home / US. 为什么研究：多房间音频品类开创者、软件+硬件长期支持模式、App 灾难后的品牌修复。建议产品：Sonos One, Sonos Arc。
- Ring — company / smart home / security / Amazon 收购. 为什么研究：从 Shark Tank 拒绝到 Amazon $1B 收购、门铃摄像头品类创造者、社区安全网络模式。建议产品：Ring Video Doorbell。
- Google Nest — product platform / smart home / Google. 为什么研究：Google 智能家居产品线、收购 Nest 后的整合路径、AI+硬件融合的学习案例。建议产品：Nest Learning Thermostat, Nest Cam。
- iRobot — company / home robot / Roomba / US. 为什么研究：消费级机器人先驱、从军工到消费的转型、Amazon 收购失败后的自救。建议产品：Roomba。
- Skydio — company / drone / autonomous / US enterprise. 为什么研究：自主飞行技术领先者、从消费级到企业级的战略 pivot、美国本土替代 DJI 的案例。建议产品：Skydio X10。
- Zipline — company / drone delivery / medical / Africa→US. 为什么研究：医疗无人机配送先行者、从非洲到美国的扩展路径、即时物流的另类解法。建议产品：Zipline Platform 2。
- Boston Dynamics — company / robotics / Hyundai / US. 为什么研究：标志性机器人公司、从研发到商业化的漫漫长路、Hyundai 收购后的商业化加速。建议产品：Spot, Atlas。
- Figure AI — company / humanoid robot / AI / US startup. 为什么研究：人形机器人最有话题的新创企、OpenAI/Microsoft/NVIDIA 注资、从概念到 BMW 工厂试点的速度。建议产品：Figure 02。
- Agility Robotics — company / humanoid robot / logistics / US. 为什么研究：Digit 机器人率先进入物流场景、与 Amazon 的试点合作、人形机器人商业化最前沿案例。建议产品：Digit。
- Cricut — company / crafting / smart cutting / DTC + consumables. 为什么研究：耗材驱动型硬件商业模式标杆、社区+内容驱动的增长飞轮、IPO 后增长放缓的教训。建议产品：Cricut Explore, Cricut Maker。
- Glowforge — company / laser cutter / prosumer / DTC. 为什么研究：从众筹到专业激光切割消费化的路径、软件+硬件的集成体验、订阅和耗材收入模型。建议产品：Glowforge Pro, Glowforge Aura。
- Prusa Research — company / 3D printing / open source / Czech. 为什么研究：开源硬件商业化的成功样本、社区驱动增长、从 Prusa i3 到 Prusa XL 的产品迭代。建议产品：Original Prusa i3, Prusa MK4。
- Valve / Steam Deck — company + product / gaming / platform / US. 为什么研究：PC 游戏平台的硬件延伸、掌机 PC 品类的开创、Linux 游戏生态的推动力。建议产品：Steam Deck, Steam Deck OLED。
- Nothing — company / consumer electronics / design-driven / UK. 为什么研究：OnePlus 联合创始人 Carl Pei 的新公司、设计驱动的品牌建设、手机+TWS 生态构建路径。建议产品：Nothing Phone (2), Nothing Ear。
- Rabbit — company / AI hardware / consumer / US startup. 为什么研究：AI 原生消费硬件的探索、LAM (Large Action Model) 概念的市场验证、R1 从爆火到口碑崩塌的完整教训。建议产品：Rabbit R1。
- Humane — company / AI hardware / wearable / US startup. 为什么研究：前 Apple 设计师创办的 AI 硬件公司、AI Pin 的灾难级发布、AI 可穿戴的产品-市场匹配教训。建议产品：Ai Pin。

## 4. P2 平台型 / 半导体 / AI 基础设施

- AMD — company / semiconductor / US. 为什么研究：从破产边缘到超越 Intel、chiplet 架构创新、AI GPU 市场追赶 NVIDIA。
- Intel — company / semiconductor / US. 为什么研究：半导体 IDM 模式的兴衰、制造工艺落后的教训、Gelsinger 复兴计划。
- Qualcomm — company / semiconductor / mobile / US. 为什么研究：移动芯片商业模式（专利授权+芯片销售）、汽车和 IoT 多元化。
- Arm — company / semiconductor / IP licensing / UK. 为什么研究：IP 授权模式的极致、从移动到数据中心的扩展、SoftBank 收购和 IPO。
- Broadcom — company / semiconductor / infrastructure / US. 为什么研究：Hock Tan 的并购整合模式、VMware 收购后的软件转型。
- ASML — company / semiconductor equipment / Netherlands. 为什么研究：EUV 光刻机垄断、技术壁垒的极致案例、地缘政治影响。
- TSMC — company / semiconductor foundry / Taiwan. 为什么研究：纯代工模式的胜利、先进制程竞争、地缘政治风险。
- Cerebras — company / AI chip / US startup. 为什么研究：晶圆级芯片的激进路线、与 NVIDIA 的差异化竞争、AI 推理芯片的未来。
- CoreWeave — company / AI cloud / GPU cloud / US. 为什么研究：从挖矿到 AI 云计算的 pivot、GPU 即服务模式、NVIDIA 生态中的重要一环。
- Supermicro — company / server hardware / US. 为什么研究：AI 服务器市场的低调巨头、与 NVIDIA 的紧密合作、液冷技术的领先。
- Oracle Cloud Infrastructure — platform / cloud / US. 为什么研究：OCI 在 AI 训练云市场的异军突起、与 NVIDIA 的深度合作、从数据库到 AI 云的转型。
- Scale AI — company / AI data / US startup. 为什么研究：AI 数据标注基础设施、从标注服务到 AI 数据平台的演进、国防和政府合同。
- Anthropic — company / AI / safety / US. 为什么研究：AI 安全研究的商业化、从 OpenAI 出走创办的故事、Claude 模型和 AWS 合作。
- OpenAI — company / AI / platform / US. 为什么研究：ChatGPT 现象级增长的 GTM 分析、从非营利到营利实体的转型、API 平台商业模式。

## 5. P3 人物类

人物类说明：如果 TARGET_TYPE=person，top_products 可以改为代表产品、代表公司、关键战略决策、关键平台、关键商业模式转折。

- Jensen Huang — person / NVIDIA CEO. 代表产品：GPU / CUDA / DGX / AI Data Center. 为什么研究：30 年 CEO 的长期主义、从游戏到 AI 的战略远见、皮衣+keynote 的个人品牌建设。
- Lisa Su — person / AMD CEO. 代表产品：Ryzen / EPYC / MI300X. 为什么研究：扭转濒临破产的 AMD、技术复兴的领导力、半导体行业最成功的 CEO 之一。
- Steve Jobs — person / Apple co-founder. 代表产品：Macintosh / iPod / iPhone / iPad. 已生成报告。
- Elon Musk — person / Tesla/SpaceX/xAI founder. 代表产品：Tesla Model 3 / Starlink / Falcon 9. 已生成报告。
- Sam Altman — person / OpenAI CEO. 代表产品：ChatGPT / GPT-4 / OpenAI API. 为什么研究：从 YC 到 OpenAI 的跳跃、AI 时代的平台建设者、争议中的领导力。
- Jeff Bezos — person / Amazon founder. 代表产品：AWS / Amazon Prime / Kindle. 为什么研究：Day 1 理念、长期主义在上市公司的实践、从书店到 Everything Store 的战略演化。
- James Dyson — person / Dyson founder. 代表产品：Dyson DC01 / Dyson Airblade / Dyson Supersonic. 为什么研究：5127 个原型的坚持、工程驱动品牌建设、英国制造业复兴。
- Palmer Luckey — person / Oculus/Anduril founder. 代表产品：Oculus Rift / Anduril Lattice. 为什么研究：从 VR 到国防科技的跳跃、非传统路径的创业家、年轻技术创始人的标杆。
- Mark Zuckerberg — person / Meta CEO. 代表产品：Facebook / Instagram / Meta Quest / Llama. 为什么研究：从宿舍到万亿美元的演进、元宇宙押注、开源 AI 战略。
- Satya Nadella — person / Microsoft CEO. 代表产品：Azure / Microsoft 365 / GitHub Copilot. 为什么研究：微软文化转型的教科书案例、云计算翻身战、AI 时代的战略布局。

## 6. 每次调研后的记录模板

每处理完一个目标，在此处追加或更新状态：

## 7. 已处理 / 追加队列

### [2026-05-25] — Bambu Lab (拓竹科技)

- 状态：published（AUTO_PUSH=true，本轮已 push）
- TARGET_TYPE：company
- JSON 路径：data/gtm/bambu-lab.json
- 报告路径：examples/bambu-lab-report-gtm.html
- 原始报告：examples/bambulab-report.html
- gtm-check 结果：PASS（无 warning）
- push 结果：已 push（commit `e66e088` "Publish pending GTM reports"）

### [2026-05-22] — DJI (大疆创新)

- 状态：published（commit `a352af2`，已 push）
- TARGET_TYPE：company
- JSON 路径：data/gtm/dji.json
- 报告路径：examples/dji-report-gtm.html
- 原始报告：examples/dji-report.html
- gtm-check 结果：PASS（无 warning）
- publish 结果：成功 — examples/dji-report-gtm.html 生成（943 行），index.html 已更新（DJI GTM 卡片在首页最前面）
- push 结果：未 push（本轮 DO_PUSH=false）
- 主要 sources 数量：全局 14 条 + 3 个产品各 4 条（合计约 26 条来源引用）
- top_products：Phantom 系列、Mavic 系列、DJI Enterprise & Agriculture 生态
- 低可信度内容：
  - DJI 2025 年农业无人机出货 20 万台为行业报告数据（medium confidence）
  - DJI 农业无人机全球市场份额 59% vs 30-34% 不同来源口径不一致
  - 2025 年营收、估值等数字为媒体估算（DJI 为私有公司）
- 品牌上下文：包含完整的 founder_background、brand_timeline、major_turning_points、controversies_or_failures
- 授权店/代理/服务网络：包含 S/A/B 三级代理商体系、400+ 授权零售店、双轨制渠道分析
- 美国市场风险：包含 Entity List → CMC → FCC Covered List 完整时间线和影响分析
- 下一步：
  1. 本地验证通过后，将 DO_PUSH 改为 true 并执行 --publish --push
  2. 或手动执行：`node scripts/gtm-workflow.js "DJI" --publish --push --commit-message "Publish DJI GTM report"`
  3. 建议下一个目标：Bambu Lab（3D 打印，品类开创者路径与 DJI 的 Phantom 类似）

### [2026-05-21] — NVIDIA

- 状态：published
- TARGET_TYPE：company
- JSON 路径：data/gtm/nvidia.json
- 报告路径：examples/nvidia-report-gtm.html
- gtm-check 结果：PASS
- push 结果：已 push

### [2026-05-20] — Anker

- 状态：published
- TARGET_TYPE：company
- JSON 路径：data/gtm/anker.json
- 报告路径：examples/anker-report-gtm.html
- gtm-check 结果：PASS
- push 结果：已 push

### [2026-05-25] — SpaceX

- 状态：published（AUTO_PUSH=true，本轮已 push）
- TARGET_TYPE：company / space_company
- JSON 路径：data/gtm/spacex.json
- 报告路径：examples/spacex-report-gtm.html
- 基础报告路径：examples/spacex-report.html（本轮新创建）
- gtm-check 结果：PASS（无 warning，无 critical）
- 全局 sources：15 条（SpaceX/Starlink官网、NASA、FAA、FCC、Bloomberg、Reuters、CNBC、SpaceNews、Ars Technica、NASASpaceFlight、Payload、The Verge、YouTube官方频道）
- top_products：
  1. Falcon 9 / Falcon Heavy — 可回收火箭（high confidence）
  2. Starlink — 低轨卫星互联网星座（medium confidence）
  3. Starship / Super Heavy — 超重型全复用运载系统（medium confidence）
- 品牌上下文：包含完整 founder_background（Musk从PayPal到SpaceX）、brand_timeline（2002-2025年25个关键节点）、major_turning_points（6个关键转折）、controversies_or_failures（11项争议/失败）
- 低可信度内容：
  - SpaceX 2024年营收估算$13-15B+（private company，基于Payload Space等第三方估算）
  - Starlink 2024年收入估算$8-10B+（private company）
  - 估值$350B来自tender offer媒体报道而非正式财务文件
  - Starlink 用户数500万+来自公开公告但可能有延迟
  - Starship $10B+研发投入为行业分析估算
- NASA/FAA/FCC/Starlink/defense/launch market 分析：均包含
- 争议和风险：Falcon 1三次失败、CRS-7/Amos-6爆炸、Starlink乌克兰争议、Boca Chica环境争议、天文观测争议、FAA监管摩擦、Musk个人政治风险
- 下一步建议：下一个目标 Figure AI（人形机器人最具话题的创企，OpenAI/Microsoft/NVIDIA注资，从概念到BMW工厂试点的速度）

### [2026-05-25] — Figure AI

- 状态：published（AUTO_PUSH=true，本轮已 push）
- TARGET_TYPE：embodied_ai_company
- JSON 路径：data/gtm/figure-ai.json
- 报告路径：examples/figure-ai-report-gtm.html
- 基础报告路径：examples/figure-ai-report.html（本轮新创建）
- gtm-check 结果：PASS（无 warning，无 critical）
- 全局 sources：12 条（Figure AI官网、Bloomberg、Reuters、TechCrunch、CNBC、The Verge、BMW Group、NVIDIA、Archer Aviation等）
- top_products：
  1. Figure 01 / 01 + OpenAI Integration — 初代平台+AI集成爆红（high confidence）
  2. Figure 02 — BMW 工厂部署的商业化版本（medium confidence）
  3. Helix (VLA Model) + BotQ Manufacturing Platform — 全栈自主战略（low confidence）
- 品牌上下文：包含完整 founder_background（Brett Adcock从Vettery/Archer到Figure AI）、brand_timeline（2022-2025年14个关键节点）、major_turning_points（5个关键转折）、controversies_or_failures（8项争议/风险）
- 低可信度内容：
  - 2025年 $40B 估值未正式确认（媒体报道，low_confidence）
  - 年 burn rate $150-300M 为行业估算（private company）
  - Figure 02 制造成本 $100K-$250K 为行业估算
  - BotQ 年产12,000台为规划目标，尚未建成
  - RaaS 定价模型为 industry assumption，Figure AI 未公开
  - 公司 pre-revenue（near zero revenue），所有商业数据尚未公开
- BMW / OpenAI / Microsoft / NVIDIA / Jeff Bezos / Helix / BotQ / manufacturing 分析：均包含
- 争议和风险：demo与真实部署鸿沟、OpenAI合作终止、制造规模化风险、估值泡沫质疑、竞争加剧、劳动力替代社会阻力
- 下一步建议：Agility Robotics（Digit已在Amazon/GXO仓库商业化运行，是人形机器人商业化最前沿的验证案例）
