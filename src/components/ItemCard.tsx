import { Dispatch, SetStateAction, useState } from 'react';
import { getFormattedDate, parseItem, updateSingleItem } from '../lib/utils';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { Button } from './ui/button';
import { Clock, Loader2, Trash2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export interface Item extends ReturnType<typeof parseItem> {
    id: number;
	last_updated?: string;
}

const ItemCard = ({
	item,
	index,

}: {
	item: Item;
	index: number;
	setDataset: Dispatch<SetStateAction<Item[]>>;
	dataset: Item[];
}) => {
	const [entities, setEntities] = useState(item.entities);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const onSave = async () => {
		try {
			toast({
				title: 'Saving In Progress',
				description:
					'Please wait while we save this entry, this may take a few seconds',
			});
			setIsLoading(true);
            await updateSingleItem(item.id, {
                entities: entities,
                last_updated: new Date().toISOString(),
            })	
			setIsLoading(false);
			toast({
				title: 'Entry Saved Successfully',
			});
		} catch (e) {
			toast({
				title: 'Error',
				description: 'An error occured while saving the file',
				variant: 'destructive',
			});
			console.error(e);
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{index + 1}. {item.transcript}</CardTitle>
			</CardHeader>
			<CardContent>
				{entities.map((entity, index) => (
					<div className='flex gap-4 mb-4'>
						<Input
							value={entity.value}
							onChange={(e) => {
								const updatedEntities = [...entities];
								const startIndex = item.transcript.indexOf(e.target.value);
								const endIndex =
									startIndex === -1 ? -1 : startIndex + e.target.value.length;
								updatedEntities[index] = {
									...updatedEntities[index],
									value: e.target.value,
									indices: [startIndex, endIndex],
								};
								setEntities(updatedEntities);
							}}
						/>
						<Select
							onValueChange={(value) => {
								const updatedEntities = [...entities];
								updatedEntities[index] = {
									...updatedEntities[index],
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									type: value as any,
								};
								setEntities(updatedEntities);
							}}
							value={entity.type}
						>
							<SelectTrigger>{entity.type}</SelectTrigger>
							<SelectContent>
								<SelectItem value='MAP_TYPE'>MAP_TYPE</SelectItem>
								<SelectItem value='ACTION'>ACTION</SelectItem>
								<SelectItem value='GPE'>GPE</SelectItem>
							</SelectContent>
						</Select>
						<Button
							onClick={() => {
								const updatedEntities = [...entities];
								updatedEntities.splice(index, 1);
								setEntities(updatedEntities);
							}}
							variant={'ghost'}
						>
							<Trash2 />
						</Button>
					</div>
				))}
				{item.last_updated && (
					<Alert>
						<Clock className='mr-2 h-4 w-4' />
						<AlertTitle>Last Updated</AlertTitle>
						<AlertDescription>
							{getFormattedDate(item.last_updated)}
						</AlertDescription>
					</Alert>
				)}
			</CardContent>
			<CardFooter>
                <Button
                    className='mr-4'
					onClick={() => {
						setEntities([
							...entities,
							{
								value: '',
								indices: [0, 0],
								type: 'ACTION',
							},
						]);
					}}
					variant={'outline'}
				>
					Add Entity
				</Button>
				<Button onClick={onSave} variant={'outline'} disabled={isLoading}>
					{isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					Save
				</Button>
			</CardFooter>
		</Card>
	);
};

export default ItemCard;
