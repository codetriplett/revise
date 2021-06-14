import $ from '@triplett/stew';
import arrange from './arrange';
import Buttons from './buttons';
import stringify from './stringify';

export default function App ({
	'': {
		'': hook,
		post,
		method,
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

			const { search } = window.location;
			const params = {};

			for (const string of search.slice(1).split('&')) {
				const index = string.indexOf('=');
				if (!~index) continue;
				else params[string.slice(0, index)] = string.slice(index + 1);
			}

			const method = ['post', 'put'].find(key => () => {
				return Object.prototype.hasOwnProperty.call(params, key)
			});

			const post = params[method];

			Promise.all([post, params.get].map(path => {
				return path && fetch(path).then(data => data.json());
			})).then(([overrides, candidates]) => {
				const { '': path } = overrides;
				let promise = Promise.resolve();
				if (!candidates) candidates = {};
				if (path) promise = fetch(path).then(data => data.json());

				promise.then(defaults => {
					const composite = arrange([
						overrides,
						defaults,
						overrides,
						candidates
					]);

					const [value] = stringify(composite);
					hook({ post, method, path, defaults, overrides, candidates, value });
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
					${composite.slice(4).map(composite => $`
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
				const file = objectString.replace(/\n+(?=\n)/g, '');

				fetch(post, {
					method: method.toUpperCase(),
					body: `{"file":${JSON.stringify(file)}}`
				}).then(() => {
					window.location.reload();
				});
			}}
		>Submit</>
	`;
}
