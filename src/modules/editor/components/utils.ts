import { Value, Editor } from 'slate';

export const DEFAULT_NODE = 'paragraph';

/**
 * Check if the current selection has a mark with `type` in it.
 */
export const hasMark = (value: Value, type: string) => {
  return value.activeMarks.some(mark => !!mark && mark.type === type);
};

/**
 * Check if the any of the currently selected blocks are of `type`.
 */
export const hasBlock = (value: Value, type: string) => {
  return value.blocks.some(node => !!node && node.type === type);
};

/**
 * Check if the any of the currently selected blocks is a link.
 */
export const hasLinks = (value: Value) => {
  return value.inlines.some(inline => !!(inline && inline.type == 'link'));
};

/**
 * A change helper to standardize wrapping links.
 */
export const wrapLink = (editor: Editor, href: string) => {
  editor.wrapInline({
    type: 'link',
    data: { href },
  });

  editor.moveToEnd();
};

/**
 * A change helper to standardize unwrapping links.
 */
export const unwrapLink = (editor: Editor) => {
  editor.unwrapInline('link');
};

export const insertImage = (editor: Editor, src: string, target: any) => {
  if (target) {
    editor.select(target);
  }

  editor.insertBlock({
    type: 'image',
    data: { src },
  });
};
