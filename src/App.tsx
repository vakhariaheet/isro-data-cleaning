import { useEffect, useState } from 'react';
import './App.css';


import { getDataset, supabase } from './lib/utils';
import ItemCard, { Item } from './components/ItemCard';
import { Toaster } from './components/ui/toaster';



function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ dataset, setDataset ] = useState<Item[]>([]);

  useEffect(() => {
    if(dataset.length > 0) return; 
    (async () => { 
      const resp = (await getDataset());
      if(!resp) return;
      setDataset(resp);
    })()
  }, [])
  
  useEffect(() => {
    supabase.channel('items').on('postgres_changes', { event: '*', schema: '*' }, async (payload) => {
      console.log('payload',payload);
      if (payload.eventType === 'UPDATE') {
        const resp = (await getDataset());
        if(!resp) return;
        setDataset(resp);
      } 
    }).subscribe();
   }, [])
  
	return (
		<div className='grid grid-cols-fluid gap-4 p-4'>
      {dataset.map((item, index) => (
        <ItemCard index={index} dataset={dataset} setDataset={setDataset} item={item} key={index} />
      ))}
      <Toaster/>
		</div>
	);
}

export default App;
