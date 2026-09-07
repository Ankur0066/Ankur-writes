const allowedStatuses = new Set(['draft', 'published']);
const allowedBlockTypes = new Set(['paragraph', 'heading', 'code', 'diagram', 'image', 'quote', 'divider']);

function validatePostInput(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.trim().length > 255) errors.push('title must be between 3 and 255 characters');
  }
  if (body.summary !== undefined && body.summary !== null && (typeof body.summary !== 'string' || body.summary.length > 1024)) errors.push('summary must be at most 1024 characters');
  if (body.status !== undefined && !allowedStatuses.has(body.status)) errors.push('status must be draft or published');
  if (body.publish_at !== undefined && body.publish_at !== null && Number.isNaN(Date.parse(body.publish_at))) errors.push('publish_at must be a valid date');
  if (body.blocks !== undefined) {
    if (!Array.isArray(body.blocks)) errors.push('blocks must be an array');
    else body.blocks.forEach((block, index) => {
      if (!block || !allowedBlockTypes.has(block.type)) errors.push(`blocks[${index}].type is invalid`);
      if (!block || !block.data || typeof block.data !== 'object' || Array.isArray(block.data)) errors.push(`blocks[${index}].data must be an object`);
    });
  }
  return errors;
}

module.exports = { validatePostInput, allowedBlockTypes };
