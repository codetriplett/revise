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
});
