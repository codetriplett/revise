import $ from '@triplett/stew';
import arrange from './arrange';
import extract from './extract';
import stringify from './stringify';

function Buttons ({ object, composite, update }) {
	const [key, sources, arrayed, ...composites] = composite;
	const [custom,, overrides, candidates] = sources;
	const subobject = object[key];
	let state = '';

	function subupdate (value) {
		const result = Array.isArray(object) ? [] : {};
		update(Object.assign(result, { ...object, [key]: value }));
	}

	if (custom !== composite && custom !== overrides) state = 'revert';
	else if (candidates !== undefined) state = 'promote';

	return $`
		<div class="property">
			${state && $`
				<button
					class=${state}
					type="button"
					onclick=${() => {
						let index;

						switch (state) {
							case 'revert': index = 2; break;
							case 'promote': index = 3; break;
							default: return;
						}

						let value = sources[index];

						if (value === composite) {
							value = extract(value, index, subobject);
						}

						subupdate(value);
					}}
				/>`
			}
		</>
		${arrayed !== undefined && $`
			<div class="object">
				${composites.map(it => $`
					<${Buttons}
						object=${subobject}
						composite=${it}
						update=${subupdate}
					/>
				`)}
			</>
		`}
	`;
}

export default function App ({
	'': {
		'': hook,
		defaults,
		overrides,
		candidates,
		value,
		typing,
		collapsed
	}
}) {
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

			const { pathname, search, hash } = window.location;
			const params = {};

			for (const string of search.slice(1).split('&')) {
				const index = string.indexOf('=');
				if (!~index) params[string] = pathname;
				else params[string.slice(0, index)] = string.slice(index + 1);
			}

			const method = ['post', 'put', 'get'].find(key => () => {
				return Object.prototype.hasOwnProperty.call(params, key)
			});

			const destination = params[method];

			Promise.all([
				`${pathname}.json`,
				`${destination}.json`,
				`${hash.slice(1)}.json`
			].map(path => {
				return fetch(path).then(data => data.json());
			})).then(([defaults, overrides, candidates]) => {
				const composite = arrange([overrides, defaults, {}, candidates]);
				const [objectString] = stringify(composite);

				hook({
					defaults,
					overrides,
					candidates,
					value: objectString
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
		` :$`
			<button
				class="toggle"
				type="button"
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
			onclick=${() => {
				try { object = JSON.parse(value); } catch (err) {}
				value = JSON.stringify(value, null, '\t');
				console.log('== submit ==', value);
			}}
		>Submit</>
	`;
}
