import resolve from './resolve';
import expand from './expand';

jest.mock('./expand');

describe('resolve', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns value', async () => {
		const actual = await resolve('abc');
		expect(actual).toEqual('abc');
	});

	it('loads additional defaults', async () => {
		expand.mockImplementation(composite => {
			const { '': path } = composite;

			switch (path) {
				case '/layout.json': return Promise.resolve({
					component: {
						'': '/component.json',
						value: 'layout',
						layout: true
					},
					value: 'layout',
					layout: true
				});
				case '/component.json': return Promise.resolve({
					value: 'component',
					layout: true,
					component: true
				});
				default: return Promise.resolve(composite);
			}
		});

		const actual = await resolve({
			'': '/layout.json',
			component: {
				'': '/component.json'
			}
		});

		expect(expand.mock.calls).toEqual([
			[
				{
					'': '/layout.json',
					component: {
						'': '/component.json'
					}
				},
				undefined,
				undefined
			],
			[
				{
					'': '/component.json',
					value: 'layout',
					layout: true
				},
				undefined,
				undefined
			]
		]);

		expect(actual).toEqual({
			component: {
				value: 'component',
				layout: true,
				component: true
			},
			value: 'layout',
			layout: true
		});
	});

	it('supports id', async () => {
		expand.mockImplementation((composite, id) => {
			const { '': path } = composite;

			switch (path) {
				case '#': return Promise.resolve(id);
				default: return Promise.resolve(composite);
			}
		});

		const actual = await resolve({ '': '#' }, 'abc');

		expect(expand.mock.calls).toEqual([
			[
				{ '': '#' },
				'abc',
				undefined
			]
		]);

		expect(actual).toEqual('abc');
	});

	it('supports default arrays', async () => {
		expand.mockImplementation(composite => {
			const { '': path } = composite;

			switch (path) {
				case '/layout.json': return Promise.resolve([
					{
						'': '/component.json',
						value: 'layout',
						layout: true
					}
				]);
				case '/component.json': return Promise.resolve({
					value: 'component',
					layout: true,
					component: true
				});
				default: return Promise.resolve(composite);
			}
		});

		const actual = await resolve({
			'': '/layout.json',
			0: {
				'': '/component.json'
			}
		});

		expect(expand.mock.calls).toEqual([
			[
				{
					'': '/layout.json',
					0: {
						'': '/component.json'
					}
				},
				undefined,
				undefined
			],
			[
				{
					'': '/component.json',
					value: 'layout',
					layout: true
				},
				undefined,
				undefined
			]
		]);

		expect(actual).toEqual([
			{
				value: 'component',
				layout: true,
				component: true
			}
		]);
	});

	it('skips empty', async () => {
		expand.mockImplementation(composite => {
			const { '': path } = composite;

			switch (path) {
				case '/layout.json': return Promise.resolve({
					component: {
						'': '/component.json',
						value: 'layout',
						layout: true
					},
					value: 'layout',
					layout: true
				});
				case '/component.json': return Promise.resolve();
				default: return Promise.resolve(composite);
			}
		});

		const actual = await resolve({
			'': '/layout.json',
			component: {
				'': '/component.json'
			}
		});

		expect(actual).toEqual({
			value: 'layout',
			layout: true
		});
	});
});
