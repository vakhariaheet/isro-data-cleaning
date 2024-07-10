import { useEffect, useState } from 'react';
import './App.css';

import { cn, getDataset, supabase } from './lib/utils';
import ItemCard, { Item } from './components/ItemCard';
import { Toaster } from './components/ui/toaster';
import { toast } from './components/ui/use-toast';

function App() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [dataset, setDataset] = useState<Item[]>([]);

	useEffect(() => {
		(async () => {
			if (dataset.length === 0) {
				const resp = await getDataset();
				if (!resp) return;
				setDataset(resp);
			}

			supabase
				.channel('items')
				.on(
					'postgres_changes',
					{ event: '*', schema: '*' },
					async (payload) => {
						let data = dataset;
						if (data.length === 0) {
							console.log('Fetching data')
							const resp = await getDataset();
							if (!resp) return  console.log('resp is empty', resp);
							data = resp;
							setDataset(resp);
						}
						
						if (payload.eventType === 'UPDATE') {
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
									'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
								),
								draggable: true,
								title: 'Update',
								description: `'${payload.new.id %600}. ${payload.new.transcript}'
             has been updated`,
							});
						}
					},
				)
				.subscribe();
		})();
	}, []);

	return (
		<div className='grid grid-cols-3 gap-4 p-4'>
			{dataset.map((item, index) => (
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
	);
}

export default App;
