import type {Fragment, Node as ProseMirrorNode} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList']

function leafText(leaf: ProseMirrorNode): string {
	return leaf.type.spec.leafText?.(leaf) ?? ''
}

function blockText(node: ProseMirrorNode): string {
	return node.textBetween(0, node.content.size, '\n', leafText)
}

function serializeList(list: ProseMirrorNode, indent: string): string {
	const lines: string[] = []
	let index = (list.attrs.start as number | undefined) ?? 1
	list.forEach(item => {
		let marker = '- '
		if (list.type.name === 'orderedList') {
			marker = `${index++}. `
		} else if (list.type.name === 'taskList') {
			marker = `- [${item.attrs.checked ? 'x' : ' '}] `
		}
		const itemLines: string[] = []
		item.forEach(child => {
			itemLines.push(LIST_TYPES.includes(child.type.name)
				? serializeList(child, indent + '  ')
				: blockText(child))
		})
		lines.push(indent + marker + itemLines.join('\n'))
	})
	return lines.join('\n')
}

/** Plain text for the clipboard which keeps list markers. */
export function serializeFragmentAsText(fragment: Fragment): string {
	const blocks: string[] = []
	fragment.forEach(node => {
		blocks.push(LIST_TYPES.includes(node.type.name)
			? serializeList(node, '')
			: blockText(node))
	})
	return blocks.join('\n\n')
}
