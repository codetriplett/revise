import extract from './extract';

export default function Buttons ({ object, composite, update }) {
	const [key, sources, arrayed, ...composites] = composite;
	const [custom,, overrides, candidates] = sources;
	const subobject = object[key];
	let state = '';

	function subupdate (value) {
		const result = Array.isArray(object) ? [] : {};
		update(Object.assign(result, { ...object, [key]: value }));
	}

	if (custom !== composite ? custom !== overrides : overrides === composite) {
		state = 'revert';
	} else if (candidates !== undefined) {
		state = 'promote';
	}

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
