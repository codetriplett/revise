import $ from '@triplett/stew';

function Folder ({
	'': { '': hook, expanded },
	folder,
	callback
}) {
	const [name, path, ...content] = folder;
	if (!name) expanded = true;
	
	return $`
		${name && $`
			<button
				class="folder"
				type="button"
				onclick=${() => hook({
					expanded: !expanded
				})}
			>${expanded ? '-' : '+'}</>
			${name}
		`}
		${expanded && $`
			<ul>
				${content.map(it => $`
					<li>
						${Array.isArray(it) ? $`
							<${Folder} folder=${it} callback=${callback} />
						` : $`
							<button
								class="file"
								type="button"
								onclick=${() => callback(`${path}${it}`)}
							>${it}</>
						`}
					</>
				`)}
			</>
		`}
	`;
}

export default function Home ({
	'': { '': hook, target, primary, secondary, hash },
	folder
}) {
	return $`
		${prev => {
			if (prev) return;

			function update () {
				const { hash } = window.location;
				hook({ hash });
			}

			update();
			window.addEventListener('hashchange', update);
			return () => window.removeEventListener('hashchange', update);
		}}
		<button
			class="primary"
			type="button"
			onclick=${() => {
				hook({ target: 'primary', primary: undefined, secondary: undefined });
			}}
		>${primary || 'Set Primary'}</>
		${primary && $`
			<div class="links">
				<a
					class="edit"
					href=${[
						`/?post=${primary}`,
						secondary ? `#${secondary}` : ''
					].join('')}
					target="_blank"
				>Edit</>
				<a
					class="resolve"
					href=${[
						`/?get=${primary}`,
						hash ? `&id=${hash.slice(1)}` : '',
						secondary ? `&post=${secondary}` : ''
					].join('')}
					target="_blank"
				>Resolve</>
			</>
			<button
				class="secondary"
				type="button"
				onclick=${() => {
					hook({ target: 'secondary', secondary: undefined });
				}}
			>${secondary || 'Set Secondary'}</>
		`}
		${target && $`
			<${Folder}
				folder=${folder}
				callback=${path => {
					hook({ [target]: path, target: undefined });
				}}
			/>
		`}
	`;
}
