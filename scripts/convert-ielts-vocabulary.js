const fs = require('fs')
const path = require('path')

// 读取 vocabulary.txt 文件
const vocabularyPath = path.join(__dirname, '../../my-ielts/src/pages/vocabulary/vocabulary.txt')
const content = fs.readFileSync(vocabularyPath, 'utf-8')

// 解析词汇
const words = []
const seenWords = new Set() // 用于去重

// 按 === 分割章节（=== 表示章节结束）
// 第一个章节没有开头的 ===，后续章节都有 === 作为分隔符
const sections = content.split('===\n')

console.log(`📚 发现 ${sections.length} 个章节段`)

// 处理每个章节
for (let chapterIndex = 0; chapterIndex < sections.length; chapterIndex++) {
  const section = sections[chapterIndex]
  if (!section.trim()) continue

  // 每个章节的格式是：章节名\n+++\n单词内容
  // 按 +++ 分割标题和内容
  const parts = section.split('+++\n')
  if (parts.length < 2) continue

  const chapterTitle = parts[0].trim()
  const chapterBody = parts[1]

  console.log(`  处理章节 ${chapterIndex + 1}: ${chapterTitle}`)

  // 按 --- 分割单词组（保持组内顺序）
  const wordGroups = chapterBody.split('---\n')

  for (const wordGroup of wordGroups) {
    const lines = wordGroup.trim().split('\n')

    for (const line of lines) {
      if (!line.trim()) continue

      // 解析格式: word|pos|meaning|example|extra
      const wordParts = line.split('|')
      if (wordParts.length < 3) continue

      const word = wordParts[0].trim()
      const pos = wordParts[1].trim()
      const meaning = wordParts[2].trim()

      // 跳过空单词
      if (!word) continue

      // 处理多个单词（用 / 分隔）
      const wordVariants = word.split('/').map((w) => w.trim())

      // 为每个单词变体创建条目（保持原始顺序，只去重）
      for (const wordVariant of wordVariants) {
        if (!wordVariant) continue

        const wordKey = wordVariant.toLowerCase()

        // 如果单词已存在，跳过（保持第一次出现的顺序）
        if (seenWords.has(wordKey)) continue

        seenWords.add(wordKey)

        // 构建翻译文本：词性 + 意思
        let transText = meaning
        if (pos && pos !== '-') {
          // 如果词性已经包含点，就不再加点
          const posText = pos.endsWith('.') ? pos : `${pos}.`
          transText = `${posText} ${meaning}`
        }

        words.push({
          name: wordVariant,
          trans: [transText],
        })
      }
    }
  }
}

// 保持原始顺序，不排序

// 输出 JSON 文件
const outputPath = path.join(__dirname, '../public/dicts/IELTSVocabularyBible_MyIELTS.json')
fs.writeFileSync(outputPath, JSON.stringify(words, null, 2), 'utf-8')

console.log(`✅ 成功转换 ${words.length} 个单词`)
console.log(`📁 输出文件: ${outputPath}`)
