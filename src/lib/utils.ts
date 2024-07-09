import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  createClient
} from '@supabase/supabase-js';
import { Item } from "../components/ItemCard";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type OgItem = [
	string,
	{
		entities: [number, number, 'ACTION' | 'MAP_TYPE' | 'GPE'][];
	},
];
export function parseItem(item: OgItem) {
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

export function parseMultipleItems(items: OgItem[]) {
  return items.map(parseItem);
}

export function getOriginalMultipleItems(items: ReturnType<typeof parseMultipleItems>) {
  return items.map(getOriginalItem);
}
export const supabaseUrl = 'https://opjcgijetlvuubdfzgwm.supabase.co'
export const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const updateSingleItem = async (itemId: number, item:Partial<Item>) => { 
  console.log('item',item);
  const { data,error } = await supabase.from('items').update({
    ...item
  })
    .eq('id', itemId).select();
  console.log('data',data,error,itemId);
  return data;
}


export const getDataset = async () => { 
  const { data } = await supabase.from('items').select('*').order('id');
  
  return data;
}

export const getFormattedDate = (date: string) => { 
  const d = new Date(date);
  
  return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours() % 12}:${d.getMinutes()}:${d.getSeconds()} ${d.getHours() > 12 ? 'PM' : 'AM'}`;
}

