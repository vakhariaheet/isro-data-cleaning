import { useEffect, useState } from 'react';
import './App.css';


import { getDataset } from './lib/utils';
import ItemCard, { Item } from './components/ItemCard';
import { Toaster } from './components/ui/toaster';



function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ dataset, setDataset ] = useState<Item[]>([]);

  useEffect(() => {
    (async () => { 
      const resp = (await getDataset());
      console.log('resp', resp)
      setDataset(resp);
    })()
  },[])
  
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
