import arrange from './arrange';

describe.skip('arrange', () => {
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual(undefined);
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(one).toEqual({
			id: 'b',
			b: true
		});

		expect(actual.slice(3)).toEqual([
			false,
			['id', ['a', 'b'], ['b']],
			['a', [true, undefined], [undefined]],
			['b', [undefined, true], [true]]
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('object')
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(one).toEqual({
			id: 'b',
			b: true
		});

		expect(actual.slice(3)).toEqual([
			false,
			['id', ['a', 'b'], ['b']],
			['a', [true, undefined], [undefined]],
			['b', [undefined, true], [true]]
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('0');
		expect(first).toBe(actual);
		expect(second).toBe(actual);

		expect(one).toEqual({
			id: 'b',
			b: true
		});

		expect(actual.slice(3)).toEqual([
			false,
			['id', ['a', 'b'], ['b']],
			['a', [true, undefined], [undefined]],
			['b', [undefined, true], [true]]
		]);
	});

	it('returns composite for array in object', () => {
		const actual = arrange([
			{ array: ['a'] },
			{ array: ['b'] }
		], 'array');

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('array');
		expect(first).toBe(actual);
		expect(second).toBe(actual);
		expect(one).toEqual(['b']);

		expect(actual.slice(3)).toEqual([
			true,
			['0', ['a', 'b'], ['b']]
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('0');
		expect(first).toBe(actual);
		expect(second).toBe(actual);
		expect(one).toEqual(['b']);

		expect(actual.slice(3)).toEqual([
			true,
			['0', ['a', 'b'], ['b']]
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('object');
		expect(first).toBe(actual);
		expect(second).toEqual('b');
		expect(one).toEqual('b');

		expect(actual.slice(3)).toEqual([
			false,
			['id', ['a', undefined], [undefined]],
			['a', [true, undefined], [undefined]]
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('object');
		expect(first).toBe(actual);
		expect(second).toEqual({ 0: 'b' });

		expect(one).toEqual({
			0: 'b'
		});

		expect(actual.slice(3)).toEqual([
			true,
			['0', ['a', undefined], [undefined]]
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

		const [key, [first, second], [one]] = actual;
		expect(key).toEqual('object');
		expect(first).toEqual(undefined);
		expect(second).toBe(actual);

		expect(one).toEqual({
			id: 'b',
			b: true
		});

		expect(actual.slice(3)).toEqual([
			false,
			['id', [undefined, 'b'], ['b']],
			['b', [undefined, true], [true]]
		]);
	});
});
