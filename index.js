/** @babel */
import postcss from 'postcss';
import precss from 'precss';
import postcssSafeParser from 'postcss-safe-parser';

function init() {
	const editor = atom.workspace.getActiveTextEditor();

	if (!editor) {
		return;
	}

	const selectedText = editor.getSelectedText();
	const text = selectedText || editor.getText();

	postcss(precss(atom.config.get('precss'))).process(text, {
		parser: postcssSafeParser
	}).then(result => {
		result.warnings().forEach(x => {
			console.warn(x.toString());
			atom.notifications.addWarning('precss', {detail: x.toString()});
		});

		const cursorPosition = editor.getCursorBufferPosition();

		if (selectedText) {
			editor.setTextInBufferRange(editor.getSelectedBufferRange(), result.css);
		} else {
			editor.setText(result.css);
		}

		editor.setCursorBufferPosition(cursorPosition);
	}).catch(err => {
		if (err.name === 'CssSyntaxError') {
			err.message += err.showSourceCode();
		}

		console.error(err);
		atom.notifications.addError('precss', {detail: err.message});
	});
}

export const config = {
	browsers: {
		title: 'Supported browsers',
		description: 'Using the [following syntax](https://github.com/ai/browserslist#queries).',
		type: 'array',
		default: precss.defaults,
		items: {
			type: 'string'
		}
	},
	cascade: {
		title: 'Cascade prefixes',
		type: 'boolean',
		default: true
	},
	remove: {
		title: 'Remove unneeded prefixes',
		type: 'boolean',
		default: true
	}
};

export const activate = () => {
	atom.commands.add('atom-workspace', 'precss', init);
};
