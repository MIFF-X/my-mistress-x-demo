export type SemanticIconTransform = {
  rotate?: '0deg' | '90deg' | '180deg' | '270deg';
  flip?: 'horizontal' | 'vertical' | 'both' | 'none';
  inline?: boolean;
};

export type SemanticIconReference = {
  sourcePrefix: string;
  sourceName: string;
  semanticName: string;
  useCase: string;
  transform?: SemanticIconTransform;
};

export function createSemanticIconReference(sourcePrefix: string, sourceName: string, useCase = 'ui-actions', transform?: SemanticIconTransform): SemanticIconReference {
  return {
    sourcePrefix,
    sourceName,
    semanticName: `${sourcePrefix}:${sourceName}`,
    useCase,
    transform,
  };
}

export function parseSemanticIconReference(value: string, useCase = 'ui-actions', transform?: SemanticIconTransform) {
  const trimmed = value.trim();
  const [sourcePrefix, ...nameParts] = trimmed.split(':');
  const sourceName = nameParts.join(':');

  if (!sourcePrefix || !sourceName) {
    return null;
  }

  return createSemanticIconReference(sourcePrefix, sourceName, useCase, transform);
}

export function createIconifyComponentUsage(reference: SemanticIconReference) {
  const transformParts = [];
  if (reference.transform?.rotate && reference.transform.rotate !== '0deg') transformParts.push(`rotate="${reference.transform.rotate}"`);
  if (reference.transform?.flip && reference.transform.flip !== 'none') transformParts.push(`flip="${reference.transform.flip}"`);
  if (reference.transform?.inline) transformParts.push('inline');
  const transformProps = transformParts.length ? ` ${transformParts.join(' ')}` : '';

  return {
    webComponent: `<iconify-icon icon="${reference.semanticName}"${transformProps}></iconify-icon>`,
    react: `<Icon icon="${reference.semanticName}"${transformProps} />`,
    svelte: `<Icon icon="${reference.semanticName}"${transformProps} />`,
  };
}

export function createMistressXAssetPrompt(reference: SemanticIconReference) {
  const transforms = [];
  if (reference.transform?.rotate && reference.transform.rotate !== '0deg') transforms.push(`rotated ${reference.transform.rotate}`);
  if (reference.transform?.flip && reference.transform.flip !== 'none') transforms.push(`flipped ${reference.transform.flip}`);
  if (reference.transform?.inline) transforms.push('aligned inline with text');

  return [
    `Create an original Mistress-X themed SVG for ${reference.useCase}.`,
    `Semantic reference: ${reference.semanticName}.`,
    transforms.length ? `Composition hint: ${transforms.join(', ')}.` : '',
    'Do not trace or copy third-party paths.',
    'Use black velvet panels, antique gold linework, burgundy wax accents and crisp vector geometry.',
  ].filter(Boolean).join(' ');
}

export function createMistressXPackName(reference: SemanticIconReference) {
  const readableName = reference.sourceName.replace(/[-_]/g, ' ');
  return `Mistress-X ${readableName} asset`;
}
