import { useEffect, useState } from 'react';
import './App.css';

import { cn, getDataset, supabase } from './lib/utils';
import ItemCard, { Item } from './components/ItemCard';
import { Toaster } from './components/ui/toaster';
import { toast } from './components/ui/use-toast';

import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

function App() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [dataset, setDataset] = useState<Item[]>([]);
	const [ filters, setFilters ] = useState<number[]>([ 1, 10 ]);
	
	useEffect(() => {
		(async () => {
			if (dataset.length === 0) {
				const resp = await getDataset();
				if (!resp) return;
				setDataset(resp);
				setFilters([1, resp.length]);
			}

			supabase
				.channel('items')
				.on(
					'postgres_changes',
					{ event: '*', schema: '*' },
					async (payload) => {
						if (payload.eventType !== 'UPDATE') return;
						const position = payload.new.id % 600;
						
						if (position < filters[0] || position > filters[1]) return;
						let data = dataset;
						if (data.length === 0) {
							console.log('Fetching data');
							const resp = await getDataset();
							if (!resp) return console.log('resp is empty', resp);
							data = resp;
							setDataset(resp);
						}

						
							console.log('payload', payload);
							const updatedItem = payload.new as Item;

							const updatedItemIndex = data.findIndex(
								(item) => item.id === updatedItem.id,
							);

							const updatedDataset = [...data];
							updatedDataset[updatedItemIndex] = updatedItem;
							setDataset(updatedDataset);
							data = updatedDataset;
							toast({
								className: cn(
									'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4',
								),
								draggable: true,
								title: 'Update',
								description: `'${payload.new.id % 600}. ${
									payload.new.transcript
								}'
             has been updated`,
							});
						
					},
				)
				.subscribe();
		})();
	}, []);

	return (
		<div className='p-4'>
			<div className='flex gap-4 w-1/3 mb-4'>
				<div className='w-full'>
					<Label className='text-sm mb-1' htmlFor='minRange'>
						Min Range
					</Label>
					<Input type='number'
					onChange={(e) => setFilters([parseInt(e.target.value), filters[1]])}
						value={filters[ 0 ]} id='minRange' min={1} max={dataset.length} />
				</div>
				<div className='w-full'>
					<Label className='text-sm mb-1' htmlFor='minRange'>
						Max Range
					</Label>
					<Input type='number'
						onChange={(e) => setFilters([ filters[ 0 ], parseInt(e.target.value) ])}
						value={filters[ 1 ]}
						id='minRange' min={1} max={dataset.length} />
				</div>
			</div>
			<div className='grid grid-cols-3 gap-4 '>
				{dataset.filter(item => {
					const position = item.id % 600;
					return position >= filters[0]  && position <= filters[1] ;
				} ).map((item, index) => (
					<ItemCard
						index={index}
						dataset={dataset}
						setDataset={setDataset}
						item={item}
						key={index}
					/>
				))}
				<Toaster />
			</div>
		</div>
	);
}

export default App;
