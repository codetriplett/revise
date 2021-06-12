import $ from '@triplett/stew';
import arrange from './arrange';
import Buttons from './buttons';
import resolve from './resolve';
import stringify from './stringify';

export default function App ({
	'': {
		'': hook,
		path,
		defaults,
		overrides,
		candidates,
		value,
		typing,
		collapsed
	}
}) {
	if (value !== undefined && !candidates) {
		return $`<pre class="composite">${value}</>`;
	}

	let strings = [value || '{\n}', '', '', ''], object, composite;
	try { object = JSON.parse(value); } catch (err) {}

	if (!typing) {
		const sources = collapsed ? [] : [defaults, overrides, candidates];
		composite = arrange([object, ...sources]);
		strings = stringify(composite);
	}

	const [
		objectString,
		defaultsString,
		overridesString,
		candidatesString
	] = strings;

	return $`
		${prev => {
			if (prev) {
				if (!typing && !collapsed && object && (object[''] || '') !== path) {
					let promise = Promise.resolve();
					path = (object[''] || '');

					if (path) {
						promise = fetch(`${path.replace(/^(?!\/)/, '/')}.json`)
							.then(data => data.json());
					}

					promise.catch(() => {}).then(defaults => hook({
						path,
						defaults
					}));
				}

				const textarea = hook('textarea');
				const { scrollX, scrollY } = window;

				Object.assign(textarea.style, {
					width: 'auto',
					height: 'auto'
				});

				Object.assign(textarea.style, {
					width: `${textarea.scrollWidth + 20}px`,
					height: `${textarea.scrollHeight + 20}px`
				});

				window.scroll(scrollX, scrollY);
				return;
			}

			const { pathname, hash, href } = window.location;
			const editing = ~href.indexOf('#');

			Promise.all([
				`${pathname}.json`,
				hash.length > 1 && `${hash.slice(1).replace(/^(?!\/)/, '/')}.json`
			].map(path => {
				return path && fetch(path).then(data => data.json());
			})).then(([overrides, candidates]) => {
				if (!editing) {
					resolve(overrides).then(composite => {
						hook({
							value: composite ? JSON.stringify(composite, null, '\t') : ''
						});
					});

					return;
				}

				const { '': path } = overrides;
				let promise = Promise.resolve();
				if (!candidates) candidates = {};
				if (path) promise = fetch(path).then(data => data.json());

				promise.then(defaults => {
					const composite = arrange([
						overrides,
						defaults,
						{},
						candidates
					]);

					const [value] = stringify(composite);
					hook({ path, defaults, overrides, candidates, value });
				});
			});
		}}
		${typing || collapsed ? $`
			<button
				class="toggle"
				type="button"
				disabled=${!object}
				onclick=${() => hook({ typing: false, collapsed: false })}
			>Show</>
		` : $`
			<button
				class="toggle"
				type="button"
				disabled=${!object}
				onclick=${() => hook({ typing: false, collapsed: true })}
			>Hide</>
			<pre class="defaults">${defaultsString}</>
			<pre class="overrides">${overridesString}</>
			<pre class="candidates">${candidatesString}</>
			${composite && $`
				<div class="root">
					${composite.slice(3).map(composite => $`
						<${Buttons}
							object=${object}
							composite=${composite}
							update=${object => hook({ value: JSON.stringify(object) })}
						/>
					`)}
				</>
			`}
		`}
		<textarea ${{ '': 'textarea' }}
			spellcheck="false"
			onkeyup=${event => {
				event.preventDefault();
				const { target: { value } } = event;
				hook({ typing: true, value });
				return false;
			}}
		>${objectString}</>
		<button
			class="submit"
			type="button"
			disabled=${!object}
			onclick=${() => {
				const { pathname } = window.location;
				const file = objectString.replace(/\n+(?=\n)/g, '');

				fetch(`${pathname}.json`, {
					method: 'POST',
					body: `{"file":${JSON.stringify(file)}}`
				});
			}}
		>Submit</>
	`;
}
