import stringify from './stringify';

describe('stringify', () => {
	it('returns strings for simple object', () => {
		const composite = [];

		composite.push(
			undefined,
			[composite, composite],
			[true],
			false,
			['id', ['a', 'b'], [true]],
			['a', [true, undefined], [true]],
			['b', [undefined, true], [true]]
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

	it('returns strings for empty object', () => {
		const composite = [];
		composite.push('object', [{}, undefined], [composite], false);
		const actual = stringify(composite);
		expect(actual).toEqual(['{\n}', '\n']);
	});

	it('returns strings for empty array', () => {
		const composite = [];
		composite.push('array', [[], undefined], [composite], true);
		const actual = stringify(composite);
		expect(actual).toEqual(['[\n]', '\n']);
	});

	it('returns strings for empty object only in defaults', () => {
		const composite = [];
		composite.push('object', [undefined, {}], [composite], false);
		const actual = stringify(composite);
		expect(actual).toEqual(['\n', '{\n}']);
	});

	it('returns strings for empty array only in defaults', () => {
		const composite = [];
		composite.push('array', [undefined, []], [composite], true);
		const actual = stringify(composite);
		expect(actual).toEqual(['\n', '[\n]']);
	});

	it('returns strings for empty object with defaults', () => {
		const composite = [];

		composite.push(
			'obj',
			[undefined, composite],
			[{ key: 'value' }],
			false,
			['key', [undefined, 'value'], ['value']]
		);

		const actual = stringify(composite);
		expect(actual).toEqual(['\n\n', '{\n\t"key": "value"\n}']);
	});

	it('returns strings for empty array with defaults', () => {
		const composite = [];

		composite.push(
			'arr',
			[undefined, composite],
			[['value']],
			true,
			['0', [undefined, 'value'], ['value']]
		);

		const actual = stringify(composite);
		expect(actual).toEqual(['\n\n', '[\n\t"value"\n]']);
	});

	it('returns strings for complex object', () => {
		const composite = [];
		const array = [];
		const object = [];

		array.push(
			'array',
			[array, undefined, undefined, array],
			[true, true, true],
			true,
			['0', ['abc', undefined, undefined, 123], [true, true, true]],
			['1', [undefined, undefined, undefined, 789], [false, true, true]]
		);

		object.push(
			'object',
			[undefined, object, object, undefined],
			[true, true, true],
			false,
			['string', [undefined, 'abc', undefined, undefined], [true, false, false]],
			['boolean', [undefined, false, true, undefined], [true, true, false]],
			['number', [undefined, undefined, 123, undefined], [false, true, false]]
		);

		composite.push(
			undefined,
			[composite, composite, composite, composite],
			[true, true, true],
			false,
			['custom', [true, undefined, undefined, undefined], [true, true, true]],
			['defaults', [undefined, true, undefined, undefined], [true, false, false]],
			['overrides', [undefined, undefined, true, undefined], [false, true, false]],
			['candidates', [undefined, undefined, undefined, true], [false, false, true]],
			['value', ['custom', 'defaults', 'overrides', 'candidates'], [true, true, true]],
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
