import extract from './extract';

export default function Buttons ({
	'': { '': hook, hovering },
	method, object = {}, composite, update
}) {
	const [key, sources, states, arrayed, ...composites] = composite;
	const candidates = sources[3];
	const subobject = object[key];
	let state = '', tooltip;

	function subupdate (value) {
		const result = Array.isArray(object) ? [] : {};
		Object.assign(result, { ...object, [key]: value });

		if (value === undefined) {
			if (Array.isArray(object)) result.splice(key, 1);
			else delete result[key];
		}

		update(result);
	}

	if (key === '') {
		state = 'navigate';
	} else if (states[1] !== composite) {
		state = 'revert';
		tooltip = states[1];
	} else if (states[2] !== composite && candidates !== undefined) {
		state = 'promote';
		tooltip = states[2];
	} else if (typeof subobject === 'boolean') {
		state = 'toggle';
		tooltip = !subobject;
	}

	if (typeof tooltip === 'object') {
		tooltip = '';
	} else if (tooltip !== undefined) {
		tooltip = JSON.stringify(tooltip);

		if (!Array.isArray(object)) {
			tooltip = `${JSON.stringify(key)}: ${tooltip}`;
		}
	}

	return $`
		<div
			class="property"
			onmouseleave=${() => hook({ hovering: false })}
		>
			${state && $`
				<button
					class=${state}
					type="button"
					onmouseenter=${() => hook({ hovering: true })}
					onclick=${() => {
						switch (state) {
							case 'navigate': {
								const { location: { pathname } } = window;
								const url = `${pathname}?${method}=${subobject}`;
								window.open(url, '_blank');
								return;
							}
							case 'revert':
								subupdate(states[1]);
								return;
							case 'toggle':
								subupdate(!subobject);
								return;
						}

						const index = 3;
						let value = sources[index];

						if (value === composite) {
							const object = state === 'revert' ? {} : subobject;
							value = extract(value, index, object);
						}

						subupdate(value);
					}}
				/>`
			}
			${hovering && tooltip && $`<div class="tooltip">${tooltip}</>`}
		</>
		${arrayed !== undefined && $`
			<div class="object">
				<pre class="left"></>
				<div class="right">
					${composites.map(it => $`
						<${Buttons}
							method=${method}
							object=${subobject}
							composite=${it}
							update=${subupdate}
						/>
					`)}
				</>
			</>
		`}
	`;
}
