import arrange from './arrange';

describe('arrange', () => {
	it('returns composite for root object', () => {
		const actual = arrange([
			{
				id: 'a',
				a: true
			},
			{
				id: 'b',
				b: true
			}
		]);

		const [key, [first, second]] = actual;
		expect(key).toEqual(undefined);
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(actual.slice(2)).toEqual([
			false,
			['id', ['a', 'b']],
			['a', [true, undefined]],
			['b', [undefined, true]]
		]);
	});

	it('returns composite for object in object', () => {
		const actual = arrange([
			{
				object: {
					id: 'a',
					a: true
				}
			},
			{
				object: {
					id: 'b',
					b: true
				}
			}
		], 'object');

		const [key, [first, second]] = actual;
		expect(key).toEqual('object')
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(actual.slice(2)).toEqual([
			false,
			['id', ['a', 'b']],
			['a', [true, undefined]],
			['b', [undefined, true]]
		]);
	});

	it('returns composite for object in array', () => {
		const actual = arrange([
			[
				{
					id: 'a',
					a: true
				}
			],
			[
				{
					id: 'b',
					b: true
				}
			]
		], '0');

		const [key, [first, second]] = actual;
		expect(key).toEqual('0');
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(actual.slice(2)).toEqual([
			false,
			['id', ['a', 'b']],
			['a', [true, undefined]],
			['b', [undefined, true]]
		]);
	});

	it('returns composite for array in object', () => {
		const actual = arrange([
			{ array: ['a'] },
			{ array: ['b'] }
		], 'array');

		const [key, [first, second]] = actual;
		expect(key).toEqual('array');
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(actual.slice(2)).toEqual([
			true,
			['0', ['a', 'b']]
		]);
	});

	it('returns composite for array in array', () => {
		const actual = arrange([
			[
				['a']
			],
			[
				['b']
			]
		], '0');

		const [key, [first, second]] = actual;
		expect(key).toEqual('0');
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(actual.slice(2)).toEqual([
			true,
			['0', ['a', 'b']]
		]);
	});

	it('ignores identical values', () => {
		const actual = arrange([
			{ id: 'abc' },
			{ id: 'abc' }
		]);

		const [key, [first, second]] = actual;
		expect(key).toEqual(undefined);
		expect(first).toBe(actual);
		expect(second).toEqual(undefined);

		expect(actual.slice(2)).toEqual([
			false,
			['id', ['abc', undefined]]
		]);
	});

	it('ignores identical objects', () => {
		const actual = arrange([
			{ object: { id: 'abc' } },
			{ object: { id: 'abc' } }
		], 'object');

		const [key, [first, second]] = actual;
		expect(key).toEqual('object');
		expect(first).toBe(actual);
		expect(second).toEqual(undefined);

		expect(actual.slice(2)).toEqual([
			false,
			['id', ['abc', undefined]]
		]);
	});
	
	it('excludes non objects that follow', () => {
		const actual = arrange([
			{
				object: {
					id: 'a',
					a: true
				}
			},
			{
				object: 'b'
			}
		], 'object');

		const [key, [first, second]] = actual;
		expect(key).toEqual('object');
		expect(first).toBe(actual);
		expect(second).toEqual('b');

		expect(actual.slice(2)).toEqual([
			false,
			['id', ['a', undefined]],
			['a', [true, undefined]]
		]);
	});
	
	it('excludes incompatible objects that follow', () => {
		const actual = arrange([
			{
				object: ['a'],
			},
			{
				object: {
					0: 'b'
				}
			}
		], 'object');

		const [key, [first, second]] = actual;
		expect(key).toEqual('object');
		expect(first).toBe(actual);
		expect(second).toEqual({ 0: 'b' });

		expect(actual.slice(2)).toEqual([
			true,
			['0', ['a', undefined]]
		]);
	});
	
	it('excludes missing values that precede', () => {
		const actual = arrange([
			undefined,
			{
				object: {
					id: 'b',
					b: true
				}
			}
		], 'object');

		const [key, [first, second]] = actual;
		expect(key).toEqual('object');
		expect(first).toEqual(undefined);
		expect(second).toBe(actual);

		expect(actual.slice(2)).toEqual([
			false,
			['id', [undefined, 'b']],
			['b', [undefined, true]]
		]);
	});
});
