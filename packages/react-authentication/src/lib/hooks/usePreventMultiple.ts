import { useRef } from 'react';

export function usePreventMultiple<T extends any[], Result>(cb: (...args: T) => Promise<Result>) {
	const preventMultipleRef = useRef<Promise<any> | undefined>(undefined);

	return (...args: T): Promise<Result> => {
		if ( preventMultipleRef.current ) {
			return preventMultipleRef.current;
		}
		
		preventMultipleRef.current = cb(...args)
		.finally(() => {
			preventMultipleRef.current = undefined;
		});

		return preventMultipleRef.current;
	};
}
