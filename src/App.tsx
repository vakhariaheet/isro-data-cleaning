import { useEffect, useState } from 'react';
import './App.css';


import { getDataset, supabase } from './lib/utils';
import ItemCard, { Item } from './components/ItemCard';
import { Toaster } from './components/ui/toaster';



function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ dataset, setDataset ] = useState<Item[]>([]);

  useEffect(() => {
    (async () => { 
      const resp = (await getDataset());
      if(!resp) return;
      setDataset(resp);
    })()
  }, [])
  
  useEffect(() => {
    if(dataset.length === 0) return;
    supabase.channel('items').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
      if (payload.eventType === 'UPDATE') {
        const updatedItem = payload.new as Item;
        
        const updatedItemIndex = dataset.findIndex((item) => item.id === updatedItem.id);
      
      
        const updatedDataset = [ ...dataset ];
        updatedDataset[ updatedItemIndex ] = updatedItem;
        setDataset(updatedDataset);
      } 
    }).subscribe();
   }, [])
  
	return (
		<div className='grid grid-cols-3 gap-4 p-4'>
      {dataset.map((item, index) => (
        <ItemCard index={index} dataset={dataset} setDataset={setDataset} item={item} key={index} />
      ))}
      <Toaster/>
		</div>
	);
}

export default App;
