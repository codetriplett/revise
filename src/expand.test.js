import expand from './expand';

function mock (object) {
	return Promise.resolve({ json: () => object });
}

describe('expand', () => {
	const fetch = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		window.fetch = fetch;
	});

	it('loads additional defaults', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					value: 'defaults',
					defaults: true
				});
				case '/overrides.json': return mock({
					'': '/defaults.json',
					value: 'overrides',
					overrides: true
				});
			}
		});

		const actual = await expand({
			'': '/overrides.json',
			value: 'candidates',
			candidates: true
		});

		expect(actual).toEqual({
			value: 'candidates',
			defaults: true,
			overrides: true,
			candidates: true
		});
	});

	it('avoids fetch loops', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					'': '/overrides.json',
					value: 'defaults',
					defaults: true
				});
				case '/overrides.json': return mock({
					'': '/defaults.json',
					value: 'overrides',
					overrides: true
				});
			}
		});

		const actual = await expand({
			'': '/overrides.json',
			value: 'candidates',
			candidates: true
		});

		expect(actual).toEqual({
			value: 'candidates',
			defaults: true,
			overrides: true,
			candidates: true
		});
	});

	it('returns json when id is undefined', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					'': ['abc'],
					value: 'defaults',
					defaults: true
				});
			}
		});

		const actual = await expand({
			'': '/defaults.json',
			value: 'overrides',
			overrides: true
		});

		expect(actual).toEqual({
			value: 'overrides',
			defaults: true,
			overrides: true
		});
	});

	it('returns json when id is accepted', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					'': ['abc'],
					value: 'defaults',
					defaults: true
				});
			}
		});

		const actual = await expand({
			'': '/defaults.json',
			value: 'overrides',
			overrides: true
		}, 'abc');

		expect(actual).toEqual({
			value: 'overrides',
			defaults: true,
			overrides: true
		});
	});

	it('allows nested ids', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					'': ['abc'],
					value: 'defaults',
					defaults: true
				});
			}
		});

		const actual = await expand({
			'': '/defaults.json#abc',
			value: 'overrides',
			overrides: true
		});

		expect(actual).toEqual({
			value: 'overrides',
			defaults: true,
			overrides: true
		});
	});

	it('ignores path object if id is undefined', async () => {
		const actual = await expand({
			'': {
				abc: '/defaults.json'
			},
			value: 'overrides',
			overrides: true
		});

		expect(actual).toEqual({
			value: 'overrides',
			overrides: true
		});
	});

	it('uses id to choose path', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					'': ['abc'],
					value: 'defaults',
					defaults: true
				});
			}
		});

		const actual = await expand({
			'': {
				abc: '/defaults.json'
			},
			value: 'overrides',
			overrides: true
		}, 'abc');

		expect(actual).toEqual({
			value: 'overrides',
			defaults: true,
			overrides: true
		});
	});

	it('returns undefined if id is not in object', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock({
					'': ['abc'],
					value: 'defaults',
					defaults: true
				});
			}
		});

		const actual = await expand({
			'': {
				abc: '/defaults.json'
			},
			value: 'overrides',
			overrides: true
		}, 'xyz');

		expect(actual).toEqual(undefined);
	});

	it('allows default arrays', async () => {
		fetch.mockImplementation(url => {
			switch (url) {
				case '/defaults.json': return mock([
					false,
					'defaults'
				]);
			}
		});

		const actual = await expand({
			'': '/defaults.json',
			0: true
		});

		expect(actual).toEqual([
			true,
			'defaults'
		]);
	});

	it('inserts id', async () => {
		const actual = await expand({ '': '#' }, 'abc');
		expect(actual).toEqual('abc');
	});

	it('ignores id', async () => {
		const actual = await expand({ '': '#' });
		expect(actual).toEqual(undefined);
	});

	it('clears json if path is empty', async () => {
		const actual = await expand({ '': '' });
		expect(actual).toEqual(undefined);
	});
});
