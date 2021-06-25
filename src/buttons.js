import extract from './extract';

export default function Buttons ({
	'': { '': hook, hovering },
	compare, method, object = {}, composite, update
}) {
	const [key, sources, states, arrayed, ...composites] = composite;
	const [primary,, overrides, candidates, result] = sources;
	const subobject = object[key];
	let state = '', flag = subobject, tooltip;
	let flagged = typeof flag === 'boolean';
	let tooltap = flag;

	function subupdate (value) {
		const result = Array.isArray(object) ? [] : {};
		Object.assign(result, { ...object, [key]: value });

		if (value === undefined) {
			if (Array.isArray(object)) result.splice(key, 1);
			else delete result[key];
		}

		update(result);
	}

	if (key === '' && subobject && typeof subobject === 'string') {
		state = 'navigate';
	} else if (states[1] !== composite) {
		state = 'revert';
		tooltip = states[1];
	} else if (states[2] !== composite && candidates !== undefined) {
		state = 'promote';
		tooltip = states[2];
	} else if (flagged || flag === undefined) {
		if (!flagged) {
			flag = result;
			flagged = typeof flag === 'boolean';
		}

		state = 'toggle';
		tooltip = flagged ? !flag : flag;
		tooltap = flag;
	}

	if (compare) {
		if (state === 'revert' && primary !== undefined
			&& typeof overrides !== 'object') {
			state = 'highlight';
		} else {
			state = '';
			tooltip = undefined;
			tooltap = undefined;
		}
	}

	if (typeof tooltip === 'object') {
		tooltip = '';
	} else if (tooltip !== undefined) {
		tooltip = JSON.stringify(tooltip);
		tooltap = JSON.stringify(tooltap);

		if (!Array.isArray(object)) {
			tooltip = `${JSON.stringify(key)}: ${tooltip}`;
			tooltap = `${JSON.stringify(key)}: ${tooltap}`;
		}
	}

	return $`
		<div
			class=${['property', hovering && 'active']}
			onmouseleave=${() => hook({ hovering: false })}
		>
			${state && (
				state === 'highlight' ? $`
				<span class=${state} onmouseenter=${() => hook({ hovering: true })} />
				` : $`
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
								subupdate(flagged ? !flag : flag);
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
			)}
			${hovering && tooltip && $`
				<div class="tooltip">${tooltap}</>
				<div class="tooltip">${tooltip}</>
			`}
		</>
		${arrayed !== undefined && $`
			<div class="object">
				<pre class="left"></>
				<div class="right">
					${composites.map(it => $`
						<${Buttons}
							compare=${compare}
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
