const DISALLOWED_KEYWORDS = ['violence', 'weapon', 'nude', 'trademark', 'brand', 'real person'];

export const safetyGuard = (req, res, next) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'INVALID_PROMPT', message: 'Prompt text is required.' });
  }

  const lower = prompt.toLowerCase();
  const matched = DISALLOWED_KEYWORDS.find(word => lower.includes(word));

  if (matched) {
    console.warn(`[REJECTION] Site: ${req.site._id} | User: ${req.userId} | Matched: ${matched}`);
    return res.status(400).json({
      success: false,
      error: 'PROMPT_DISALLOWED',
      message: 'Prompt contains restricted terminology.',
      details: matched
    });
  }

  next();
};