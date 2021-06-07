import stringify from './stringify';

describe('stringify', () => {
	it('returns strings for simple object', () => {
		const composite = [];

		composite.push(
			undefined,
			[composite, composite],
			false,
			['id', ['a', 'b']],
			['a', [true, undefined]],
			['b', [undefined, true]]
		);

		const actual = stringify(composite);

		expect(actual).toEqual([
			[
				'{',
					'\t"id": "a",',
					'\t"a": true',
					'',
				'}'
			].join('\n'),
			[
				'',
					'',
					'',
					'\t"b": true',
				''
			].join('\n')
		]);
	});

	it('returns strings for complex object', () => {
		const composite = [];
		const array = [];
		const object = [];
		
		array.push(
			'array',
			[array, undefined, undefined, array],
			true,
			['0', ['abc', undefined, undefined, 123]],
			['1', [undefined, undefined, undefined, 789]]
		);

		object.push(
			'object',
			[undefined, object, object, undefined],
			false,
			['string', [undefined, 'abc', undefined, undefined]],
			['boolean', [undefined, false, true, undefined]],
			['number', [undefined, undefined, 123, undefined]]
		);
		
		composite.push(
			undefined,
			[composite, composite, composite, composite],
			false,
			['custom', [true, undefined, undefined, undefined]],
			['defaults', [undefined, true, undefined, undefined]],
			['overrides', [undefined, undefined, true, undefined]],
			['candidates', [undefined, undefined, undefined, true]],
			['value', ['custom', 'defaults', 'overrides', 'candidates']],
			array,
			object
		);

		const actual = stringify(composite);

		expect(actual).toEqual([
			[
				'{',
					'\t"custom": true,',
					'',
					'',
					'',
					'\t"value": "custom",',
					'\t"array": [',
						'\t\t"abc"',
						'',
					'\t]',
					'',
						'',
						'',
						'',
					'',
				'}'
			].join('\n'),
			[
				'',
					'',
					'\t"defaults": true,',
					'',
					'',
					'',
					'',
						'',
						'',
					'',
					'\t"object": {',
						'\t\t"string": "abc",',
						'\t\t"boolean": false',
						'',
					'\t}',
				''
			].join('\n'),
			[
				'',
					'',
					'',
					'\t"overrides": true,',
					'',
					'',
					'',
						'',
						'',
					'',
					'',
						'',
						'',
						'\t\t"number": 123',
					'',
				''
			].join('\n'),
			[
				'',
					'',
					'',
					'',
					'\t"candidates": true,',
					'',
					'',
						'',
						'\t\t789',
					'',
					'',
						'',
						'',
						'',
					'',
				''
			].join('\n')
		]);
	});
});
