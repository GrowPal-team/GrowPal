/** Rule-based replies when no LLM API key is configured (Arabic + English). */

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

export function getFallbackReply(userMessage: string): string {
  const t = userMessage.trim()
  const ar = hasArabic(t)
  if (!t) {
    return ar
      ? "اسألني عن النباتات، الضوء، الري، أو تجهيز المساحات الصغيرة وسأعطيك نصائح عملية."
      : "Ask me anything about plants, light, water, or a small-space setup and I will give practical tips."
  }

  const lower = t.toLowerCase()

  if (/water|irrigat|thirst|dry|wet|drain|overwater/.test(lower)) {
    return ar
      ? "للري: قارن وزن الأصيص وهو جاف مقابل بعد الري الكامل، واسقِ صباحا في الجو الحار. فرغ الصحون تحت الأصص حتى لا تختنق الجذور. الأسطح المعرضة للهواء تجف أسرع من الأماكن الداخلية."
      : "For watering: compare pot weight when dry vs soaked, and water in the morning during hot days. Empty saucers so roots do not suffocate. Windy rooftops dry containers faster than calm indoor spots."
  }
  if (/sun|light|shade|window|exposure|burn/.test(lower)) {
    return ar
      ? "عوّد النبات تدريجيا على الشمس القوية خلال أسبوع إلى أسبوعين. الظل الجزئي مناسب لكثير من الأعشاب، أما شمس الظهر المباشرة فجأة فقد تسبب حروق أوراق."
      : "Acclimate plants to stronger sun over one to two weeks. Partial shade works for many herbs, while harsh noon sun right after shade often scorches leaves."
  }
  if (/herb|basil|mint|rosemary|balcony|patio|rooftop|زعتر|نعنع|ريحان|شرفة|سطح/.test(lower)) {
    return ar
      ? "للشرفة أو السطح: الريحان والنعنع وإكليل الجبل غالبا أنسب من النباتات الحساسة جدا. استخدم أصصا أعمق مع تصريف ممتاز بدل رش خفيف ومتكرر."
      : "For balcony or rooftop herbs, basil, mint, and rosemary are often more resilient than delicate tropicals. Use deeper pots with real drainage instead of frequent light misting."
  }
  if (/soil|pot|container|fertil|feed|repot|تربة|سماد|أصيص|اصيص/.test(lower)) {
    return ar
      ? "للنباتات العصارية استخدم تربة سريعة التصريف، وللنباتات الورقية استخدم خليطا أغنى بالمادة العضوية. ابدأ التسميد بنصف الجرعة خلال موسم النمو. الأصص بدون فتحات تصريف سبب شائع لتعفن الجذور."
      : "Use fast-draining mix for succulents and more organic-rich mix for leafy plants. Start fertilizer at half strength during active growth. Pots without drainage holes are a common root-rot trap."
  }
  if (/bug|pest|fung|yellow|wil|spotted|leaf|حشرة|آفة|اصفر|ذبول|بقع/.test(lower)) {
    return ar
      ? "اصفرار الأوراق قد يكون بسبب زيادة الري أو نقص العناصر أو ضوء غير مناسب. راقب رطوبة التربة وتغييرات المكان الأخيرة، واذكر نوع النبات أو أرسل صورة لنصيحة أدق."
      : "Yellowing can result from overwatering, nutrient issues, or unsuitable light. Check soil moisture and recent location changes, and share the plant type or photo for more precise guidance."
  }

  return ar
    ? "شكرا لسؤالك. اضبط الري والضوء حسب نوع النبات، وغيّر الظروف تدريجيا. إذا ذكرت نوع النبات وعدد ساعات الشمس اليومية أقدر أعطيك خطوات أدق."
    : "Thanks for your question. Match watering and light to your plant type, and adjust conditions gradually. If you share the species and daily sun hours, I can give more precise steps."
}
