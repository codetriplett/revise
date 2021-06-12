import merge from './merge';

function mock (object) {
	return Promise.resolve({ json: () => object });
}

describe('merge', () => {
	const fetch = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		window.fetch = fetch;
	});

	it('returns default value', () => {
		const actual = merge('abc');
		expect(actual).toEqual('abc');
	});

	it('returns override value', () => {
		const actual = merge('abc', 'xyz');
		expect(actual).toEqual('xyz');
	});

	it('merges overrides object to defaults object', () => {
		const actual = merge({
			value: 'defaults',
			defaults: true
		}, {
			value: 'overrides',
			overrides: true
		});

		expect(actual).toEqual({
			value: 'overrides',
			defaults: true,
			overrides: true
		});
	});

	it('merges overrides array to defaults array', () => {
		const actual = merge([
			'abc',
			{
				value: 'defaults',
				defaults: true
			}
		], [
			'xyz',
			{
				value: 'overrides',
				overrides: true
			}
		]);

		expect(actual).toEqual([
			'xyz',
			{
				value: 'overrides',
				defaults: true,
				overrides: true
			}
		]);
	});

	it('removes empty object props', () => {
		const actual = merge({
			value: 'defaults',
			defaults: true
		}, {
			value: 'overrides',
			overrides: {}
		});

		expect(actual).toEqual({
			value: 'overrides',
			defaults: true
		});
	});

	it('removes empty object items', () => {
		const actual = merge([
			123,
			'abc'
		], [
			{},
			'xyz'
		]);

		expect(actual).toEqual([
			'xyz'
		]);
	});
});
