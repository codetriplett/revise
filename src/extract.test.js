import extract from './extract';

describe('extract', () => {
	it('extracts value', () => {
		const actual = extract([, [, 'value'], []], 1);
		expect(actual).toEqual('value');
	});

	it('extracts object', () => {
		const actual = extract([, [, { key: 'value' }], []], 1);
		expect(actual).toEqual({ key: 'value' });
	});

	it('runs recursively on object', () => {
		const composite = [];
		composite.push('key', [, composite], [], false, ['a', [, 1]], ['b', [, 2]]);
		const actual = extract(composite, 1);
		expect(actual).toEqual({ a: 1, b: 2 });
	});

	it('runs recursively on array', () => {
		const composite = [];
		composite.push('key', [, composite], [], true, ['0', [, 'a']], ['1', [, 'b']]);
		const actual = extract(composite, 1);
		expect(actual).toEqual(['a', 'b']);
	});

	it('merges with existing data', () => {
		const composite = [];
		composite.push('key', [, composite], [], false, ['a', [, 1]], ['b', [, 2]]);
		const actual = extract(composite, 1, { b: 0, c: 3 });
		expect(actual).toEqual({ a: 1, b: 2, c: 3 });
	});
});
