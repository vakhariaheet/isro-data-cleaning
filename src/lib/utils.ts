import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  createClient
} from '@supabase/supabase-js';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Item = [
	string,
	{
		entities: [number, number, 'ACTION' | 'MAP_TYPE' | 'GPE'][];
	},
];
export function parseItem(item: Item) {
  return {
    transcript: item[ 0 ],
    entities: item[ 1 ].entities.map(([ start,end, type ]) => ({
      value: item[ 0 ].slice(start, end),
      indices:[ start, end ],
      type,
    }))
  }
}

export function getOriginalItem(item: ReturnType<typeof parseItem>) {
  return [
    item.transcript,
    {
      entities: item.entities.map(({ indices, type }) => {
        console.log('indices', [ ...indices, type ])
        return [ ...indices, type ]
      }),
    },
  ]
}

export function parseMultipleItems(items: Item[]) {
  return items.map(parseItem);
}

export function getOriginalMultipleItems(items: ReturnType<typeof parseMultipleItems>) {
  return items.map(getOriginalItem);
}
const supabaseUrl = 'https://opjcgijetlvuubdfzgwm.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export const upload = async (str:object) => {
  console.log('uploading')
  const json = JSON.stringify(str)
  const blob = new Blob([ json ], { type: 'application/json' })
  
 await supabase.storage.from('demo123334fdfdsa').upload('data.json', blob, {
    upsert: true,
  })
  const { data: data2 } = await supabase.storage.from('demo123334fdfdsa').download('data.json');
  const text = await data2?.text();


  return JSON.parse(text || '{}');  
}

export const getDataset = async () => { 
  const { data } = await supabase.storage.from('demo123334fdfdsa').download('data.json');
  const text = await data?.text();
  return JSON.parse(text || '{}');
}

export const getFormattedDate = (date: string) => { 
  const d = new Date(Number(date));
  console.log('date', d,date)
  return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours() % 12}:${d.getMinutes()}:${d.getSeconds()} ${d.getHours() > 12 ? 'PM' : 'AM'}`;
}