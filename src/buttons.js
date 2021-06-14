import extract from './extract';

export default function Buttons ({ object = {}, composite, update }) {
	const [key, sources, states, arrayed, ...composites] = composite;
	const candidates = sources[3];
	const subobject = object[key];
	let state = '';

	function subupdate (value) {
		const result = Array.isArray(object) ? [] : {};
		Object.assign(result, { ...object, [key]: value });

		if (value === undefined) {
			if (Array.isArray(object)) result.splice(key, 1);
			else delete result[key];
		}

		update(result);
	}

	if (states[1] !== composite) {
		state = 'revert';
	} else if (states[2] !== composite && candidates !== undefined) {
		state = 'promote';
	}

	return $`
		<div class="property">
			${key && state && $`
				<button
					class=${state}
					type="button"
					onclick=${() => {
						if (state === 'revert') {
							subupdate(states[1]);
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
