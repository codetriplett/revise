const $ = typeof window === 'object' ? window.$ : require('@triplett/stew');
if (typeof window !== 'object') module.exports = App;

function Modal ({
	'': { '': hook, promotionApplied, stringPreferred, updatedValue, isInvalid },
	key, value = '', candidates, close, update
}) {
	let unchanged = updatedValue === undefined;
	if (unchanged) updatedValue = value;

	if (typeof updatedValue === 'object') {
		updatedValue = JSON.stringify(updatedValue, null, '\t');
	} else if (typeof updatedValue !== 'string') {
		updatedValue = String(updatedValue);
	}
	
	if (stringPreferred === undefined) {
		stringPreferred = typeof value === 'string';
	} else {
		unchanged = false;
	}

	return $`
		<div class="modal">
			<div class="modal-backdrop" onclick=${close} />
			<div class="modal-content">
				<h2 class="modal-heading">
					${key}
					${isInvalid && $`
						<span class="error-message">Unrecognized Value</>
					`}
				</>
				<button class="modal-close" onclick=${close}>Close</>
				<textarea
					class=${[
						'modal-textarea',
						isInvalid && 'is-invalid'
					]}
					onkeyup=${event => hook({
						updatedValue: event.target.value,
						isInvalid: false
					})}
				>
					${updatedValue}
				</>
				<div
					class="modal-type"
					onclick=${() => hook({
						stringPreferred: !stringPreferred,
						isInvalid: false
					})}
				>
					<input type="checkbox" checked=${!!stringPreferred} />
					<div>string</>
				</>
				${candidates !== undefined && (
					!promotionApplied ? $`
						<button
							class="modal-promote"
							onclick=${() => hook({
								updatedValue: candidates,
								stringPreferred: typeof candidates === 'string',
								promotionApplied: true,
								isInvalid: false,
							})}
						>Promote</>
					` : $`
						<button
							class="modal-promote"
							onclick=${() => hook({
								updatedValue: undefined,
								stringPreferred: undefined,
								promotionApplied: false,
								isInvalid: false,
							})}
						>Revert</>
					`
				)}
				<button
					class="modal-update"
					disabled=${unchanged}
					onclick=${() => {
						if (!stringPreferred) {
							try {
								if (!updatedValue) updatedValue = undefined;
								else updatedValue = JSON.parse(updatedValue);
							} catch (err) {
								hook({ isInvalid: true });
								return;
							}
						}

						update(updatedValue);
						close();
					}}
				>Update</>
			</>
		</>
	`;
}

function Value ({
	'': { '': hook, modalActive, updatedOverrides },
	key, defaults, overrides, candidates
}) {
	if (updatedOverrides === undefined) updatedOverrides = overrides;
	let sources = [defaults, updatedOverrides, candidates];
	let original = updatedOverrides;
	let element;

	let [
		inDefaults,
		inOverrides,
		inCandidates
	] = sources.map(source => {
		return !key || source && hasOwnProperty.call(source, key);
	});

	if (key) {
		[
			defaults,
			updatedOverrides,
			candidates
		] = sources.map(source => {
			if (typeof source === 'object' && !Array.isArray(source)) {
				return source[key];
			}
		});
	}

	if (candidates === updatedOverrides) {
		inCandidates = false;
	}

	if (original && original === defaults) {
		inOverrides = false;
		// delete original[key];
	}

	let value = updatedOverrides;
	sources = { defaults, overrides: updatedOverrides, candidates };

	if (!inOverrides) {
		value = inCandidates ? candidates : defaults;
	}

	if (typeof value !== 'object') {
		element = $`<p class=${`value is-${typeof value}`}>${String(value)}</>`;
	} else if (Array.isArray(value)) {
	} else {
		let keys = [];

		for (const source of Object.values(sources)) {
			if (typeof source === 'object' && !Array.isArray(source)) {
				keys.push(...Object.keys(source));
			}
		}

		keys = [...new Set(keys)];

		element = $`
			<div class="object">
				${keys.map(key => $`<${Value} ${sources} key=${key} />`)}
			</>
		`;
	}

	return !key ? element : $`
		${prev => {
			if (!prev || modalActive === prev.modalActive) return;			
			else if (!modalActive) return prev['']();
			const modal = document.querySelector('#modal');

			$({ '': modal }, $`
				<${Modal}
					${inCandidates ? { candidates } : {}}
					key=${key}
					value=${updatedOverrides}
					close=${() => hook({ modalActive: false })}
					update=${updatedValue => {
						const { [key]: previous, ...object } = original;
						if (updatedValue !== undefined) object[key] = updatedValue;
						hook({ updatedOverrides: object });
					}}
				/>
			`);

			return () => $({ '': modal });
		}}
		<div
			class=${[
				'property',
				inDefaults && 'in-defaults',
				inOverrides && 'in-overrides',
				inCandidates && 'in-candidates'
			]}
			onclick=${event => {
				event.stopPropagation();
				hook({ modalActive: true });
			}}
		>
			<label class="label">${key}</>
			${element}
		</>
	`;
}

function App ({ '': { '': hook, updates = {}, isReady, ...sources } }) {
	return $`
		${prev => {
			if (prev) return;
			const { pathname, search, hash } = window.location;
			const [, method, destination] = search.match(/^\?([^=]*)=([^#]*)$/);

			Promise.all([
				`${pathname}.json`,
				`${destination}.json`,
				`${hash.slice(1)}.json`
			].map(path => {
				return fetch(path).then(data => data.json());
			})).then(([defaults, overrides, candidates]) => {
				hook({ defaults, overrides, candidates });
			});
		}}
		${!isReady && !!Object.keys(sources).length && $`<${Value} ${sources} />`}
		<button
			type="button"
			onclick=${() => hook({ isReady: !isReady })}
		>${isReady ? 'Edit' : 'Review'}</>
		${isReady && $`
			<textarea>${JSON.stringify(updates, null, '\t')}</>
			<button
				type="button"
				onclick=${() => {
					console.log(updates);
				}}
			>Commit</>
		`}
	`;
}
