# Tarot Card Image Generation Prompts

> 用于在外部 AI 图像生成工具（Midjourney / Recraft / 火山方舟 / 即梦 / Flux 等）生成「东方水墨幻想塔罗」全套 78 张的提示词集。
> 设计目标：风格统一、原创无版权、画面有故事性、适合塔罗 0.577 长宽比。

---

## 0. 通用约束（每条 prompt 都要带，确保统一性）

### 风格关键词（**Master Style Token**，复制粘贴用）

**英文版（Midjourney / Flux / Recraft 用）**：

```
Traditional Chinese ink painting (shuǐmò) merged with mineral pigment gōngbǐ, Song dynasty landscape painting aesthetic, vertical scroll composition, aged ivory rice paper background (#F4E8D0), mineral azurite blue (#3B5C8A), ochre (#A0532C), vermillion red (#B33C2F), gold leaf accents (#C9A04C), soft watercolor washes, loose ink brush strokes, flowing silk robes, ethereal mist, no text, no border frame, no watermark, no seal stamps, vertical 5:9 aspect ratio
```

**中文版（即梦 / 可灵 / 文心 / 通义万相 用）**：

```
中国水墨工笔重彩，宋代山水画美学，立轴构图，古旧米色宣纸背景，矿物石青蓝、赭石、朱砂、金箔点缀，柔和水彩晕染，写意墨笔，飘逸丝绸长袍，氤氲云雾，不要文字，不要边框，不要水印，不要印章，竖向 5:9 比例
```

### Negative Prompt（统一）

```
photo, photograph, realistic, 3d render, anime, cartoon, manga, chibi, oil painting, western style, modern clothing, latin letters, chinese calligraphy text, signature, watermark, frame, border decoration, low quality, blurry, distorted face, extra limbs
```

### Midjourney 参数建议

```
--ar 5:9 --v 7 --style raw --stylize 250 --chaos 5
```

### Recraft 参数

- Style: `vector_illustration` 中的 "ink painting" 或 `realistic_image` 中的 "塔罗"
- Aspect: `vertical` (1024×1820)

---

## 1. The Fool · 愚者 (0)

**主题**：年轻旅人立于云端山崖之上，背着行囊持杖远眺，白鹤随行，朝霞日出。

**英文 Prompt**：

```
A young Chinese traveler standing on the edge of a misty cliff at dawn, wearing flowing dark blue silk robes with subtle gold trim, holding a wooden walking staff topped with a small gold ornament, a bamboo bundle strapped to their back, looking forward toward distant misty mountains. A white crane with red crown flies gracefully nearby in the upper right. Soft morning sun rises behind layered blue mountains. Pine branches frame the cliff edge. The figure is composed and hopeful, captured mid-stride.

[INSERT MASTER STYLE TOKEN]
```

**中文 Prompt**：

```
一位中国年轻旅人，立于晨雾缭绕的云崖之上，身着深蓝色丝绸长袍配淡金色衣边，手持木质行旅杖（杖端有金色装饰），背负竹编行囊，远眺迷蒙的层叠山峦。一只丹顶白鹤在右上方优雅飞翔。淡橙色朝阳在层叠青山后升起。松枝在崖边点缀。人物神态从容希望，仿佛即将迈步。

[复制中文主风格关键词]
```

---

## 2. The Star · 星辰 (XVII)

**主题**：女子跪于月夜溪畔，双手持朱砂瓶倾水，弦月与八角主星当空，水面涟漪青莲漂浮。

**英文 Prompt**：

```
A serene Chinese woman in pale silk robes kneeling beside a moonlit pond, gently pouring water from a vermillion ceramic vase with both hands, a stream of water flowing into rippling water creating concentric circles, two pink lotus flowers floating nearby. Above her: a crescent moon glowing soft white in upper left, and one large eight-pointed gold star with seven smaller stars scattered across the deep night sky. Distant misty mountains form a low silhouette. Peaceful, hopeful, contemplative atmosphere. Vertical layout: starry sky upper third, woman center, water lower third.

[INSERT MASTER STYLE TOKEN]
```

**中文 Prompt**：

```
一位中国仕女身着月白色丝绸长袍，跪于月夜池畔，双手轻举朱红色陶瓷长颈瓶，瓶中清水缓缓倾入池中激起一圈圈涟漪，两朵粉色莲花在水面漂浮。上方：左侧弦月柔白发光，右侧一颗大金色八角星 + 七颗小白星散落于深邃夜空。远山如黛低伏。氛围宁静、充满希望、沉静凝思。竖向构图：上方星空、中央仕女、下方池水。

[复制中文主风格关键词]
```

---

## 3. The Tower · 雷塔 (XVI)

**主题**：高塔遭雷击崩裂，塔顶火焰，两人坠落，乌云翻涌瓦片飞散。

**英文 Prompt**：

```
A traditional Chinese tower (Tang dynasty wooden pagoda style) being struck by lightning at night, the top section blasted off and tilting violently in mid-air, golden flames erupting from the broken roof, dark stormy clouds churning above, dramatic white-gold lightning bolts splitting the sky. Two human figures falling from the tower in flowing silk robes - one in dark blue robes on the left side, one in deep crimson robes on the right side, both reaching out as they tumble. Wooden roof tiles scattered mid-air. Below: dark cliff and ground with small embers. Highly dramatic, apocalyptic but not gory atmosphere.

[INSERT MASTER STYLE TOKEN]
```

**中文 Prompt**：

```
一座中国传统木结构高塔（唐代风格塔楼），夜色中遭雷电劈中，塔顶整体崩飞、剧烈倾斜悬于半空，破裂屋檐处涌出金红色烈焰，深邃乌云在塔顶翻涌，戏剧性的白金色闪电劈裂夜空。两位人物从塔身坠落，身着飘扬丝绸长袍——左侧一位深蓝袍人物，右侧一位深朱袍人物，双臂张开仿佛挣扎。木质瓦片散落半空。塔下方：黑色断崖与地面散落星火点。氛围极具戏剧张力，毁灭但不血腥。

[复制中文主风格关键词]
```

---

## 工作流建议

### 一、单张精修流程（推荐先这样）

1. 复制其中一条 prompt（如 The Fool）
2. 在 Midjourney/Recraft 跑 4 张变体
3. 挑出最满意的一张作为「**Reference Image**」
4. 把 Reference Image 上传，让模型学习这个风格
5. 后续每张新卡的 prompt 用 `--cref [reference image url]`（MJ）或 reference image upload（Recraft）锁定风格

### 二、风格一致性 Checklist（每张生成后核查）

- [ ] 背景纸色是否统一为暖米色 `#F4E8D0`
- [ ] 主色调是否包含石青/朱砂/赭石中的至少 2 个
- [ ] 是否有写意墨笔笔触（非纯矢量扁平）
- [ ] 人物服饰是否飘逸（非现代服装）
- [ ] 没有自动生成的乱字 / 印章 / 边框（这些后期由前端添加）
- [ ] 比例是否近似 5:9 竖向

### 三、批量生成 78 张的成本估算（参考）

| 工具 | 单张成本 | 78张总价 | 单张耗时 | 备注 |
|---|---|---|---|---|
| **Midjourney v7** ($10/月订阅) | 0 (含订阅) | $10 | ~1分钟 | 风格统一最强，需 Discord 操作 |
| **Recraft V3** | $0.04 | $3.12 | ~5秒 | 适合工业化批量 |
| **即梦 / 可灵** | ~¥0.5 | ¥40 | ~10秒 | 中文最懂，中式美学最好 |
| **火山方舟 文生图** | ~¥0.1~0.3 | ¥10~25 | ~5秒 | 性价比最高 |
| **Flux Pro** (Replicate) | $0.05 | $3.90 | ~15秒 | 油画感最强 |

### 四、强烈建议

**不要**一次跑全 78 张。流程应该是：
1. **第 1 张** 反复调 prompt + 4 变体，定调
2. **第 2~3 张** 用 reference image，验证统一性
3. 通过后，**批量跑 22 张大阿** （主形象，重要）
4. 大阿满意后，跑 56 张小阿（多用元素+几何，简化）

---

## 后续：3 张完成后告诉我，我帮你

1. 切图：把你拿到的图（PNG/JPG）扔到 `raw-assets/ai-tarot/` 即可
2. 自动转 webp 600×1040 (塔罗 0.577 比例)
3. 入库 + 加新塔罗主题（主题名称由你定）+ 设置页选项 + 自动 fallback
