import $ from '@triplett/stew';
import arrange from './arrange';
import Buttons from './buttons';
import stringify from './stringify';

export default function App ({
	'': {
		'': hook,
		post,
		method,
		compare,
		defaults,
		overrides,
		candidates,
		result,
		value,
		selectionStart,
		selectionEnd,
		typing,
		collapsed
	}
}) {
	let strings = [value || '{\n}', '', '', ''], object, composite;
	try { object = JSON.parse(value); } catch (err) {}

	if (!typing) {
		const sources = collapsed ? [] : [defaults, overrides, candidates, result];
		composite = arrange([object, ...sources]);
		strings = stringify(composite);
	}

	const [
		objectString,
		defaultsString,
		overridesString,
		candidatesString,
		resultString
	] = strings;

	return $`
		${prev => {
			if (prev) {
				const textarea = hook('textarea');
				const { scrollX, scrollY } = window;

				if (selectionStart !== undefined && selectionEnd !== undefined) {
					Object.assign(textarea, { selectionStart, selectionEnd });
				}

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

			const { search, hash } = window.location;
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
			const resolve = Object.prototype.hasOwnProperty.call(params, 'get');
			const named = Object.prototype.hasOwnProperty.call(params, 'id');
			const get = resolve ? params.get : post;

			const paths = [
				post,
				hash.slice(1),
				`/?get=${get}${named ? `&id=${params.id}` : ''}`
			];

			Promise.all(paths.map(path => {
				return path && fetch(path).then(data => data.json()).catch(() => {});
			})).then(([overrides = {}, candidates, result]) => {
				let { '': path } = overrides;
				let object = overrides, promise = Promise.resolve(), compare;
				if (!candidates) candidates = {};

				if (resolve) {
					compare = true;
					object = result;
				} else if (path && typeof path === 'string') {
					promise = fetch(path).then(data => data.json()).catch(() => {});
				} else {
					path = undefined;
				}

				promise.then(defaults => {
					const composite = arrange([
						object,
						defaults,
						overrides,
						candidates,
						result
					]);

					const [value] = stringify(composite);
	
					hook({
						post,
						method,
						compare,
						defaults,
						overrides,
						candidates,
						result,
						value
					});
				});
			});
			
			function update () {
				const { hash } = window.location;

				if (hash.length > 1) {
					fetch(hash.slice(1))
						.then(data => data.json())
						.catch(() => {})
						.then(candidates => hook({
							candidates
						}));
				} else {
					hook({ candidates: {} });
				}
			}

			window.addEventListener('hashchange', update);
			return () => window.removeEventListener('hashchange', update);
		}}
		${typing || collapsed ? $`
			<button
				class="show"
				type="button"
				disabled=${!object}
				onclick=${() => hook({ typing: false, collapsed: false })}
			>Show</>
		` : $`
			<button
				class="show"
				type="button"
				disabled=${!object}
				onclick=${() => hook({ typing: false, collapsed: true })}
			>Hide</>
			<pre class="defaults">${defaultsString}</>
			<pre class="overrides">${overridesString}</>
			<pre class="candidates">${candidatesString}</>
			<pre class="result">${resultString}</>
			${composite && $`
				<div class="root">
					<pre class="left"></>
					<div class="right">
						${composite.slice(4).map(composite => $`
							<${Buttons}
								compare=${compare}
								method=${method}
								object=${object}
								composite=${composite}
								update=${object => hook({ value: JSON.stringify(object) })}
							/>
						`)}
					</>
				</>
			`}
		`}
		<textarea ${{ '': 'textarea' }}
			spellcheck="false"
			onkeydown=${event => {
				if (event.key !== 'Tab') return;
				event.preventDefault();

				const textarea = hook('textarea');
				const { selectionStart, selectionEnd } = textarea;
				const selectionPosition = selectionStart + 1;
				const prefix = value.slice(0, selectionStart);
				const suffix = value.slice(selectionEnd);

				hook({
					selectionStart: selectionPosition,
					selectionEnd: selectionPosition,
					typing: true,
					value: `${prefix}\t${suffix}`
				});

				return false;
			}}
			onkeyup=${event => {
				event.preventDefault();
				const { target: { value } } = event;

				hook({
					selectionStart: undefined,
					selectionEnd: undefined,
					typing: true,
					value
				});

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
