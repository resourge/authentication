import { useEffect, useRef } from 'react';

export function usePreventMultiple<T extends any[], Result>(cb: (...args: T) => Promise<Result>, preventOnUseEffect?: boolean) {
	const preventMultipleRef = useRef<Promise<any> | undefined>(undefined);

	useEffect(() => {
		if ( preventOnUseEffect ) {
			preventMultipleRef.current = undefined;
		}
	});

	return (...args: T): Promise<Result> => {
		if ( preventMultipleRef.current ) {
			return preventMultipleRef.current;
		}
		// eslint-disable-next-line n/no-callback-literal
		preventMultipleRef.current = cb(...args)
		.finally(() => {
			if ( !preventOnUseEffect ) {
				preventMultipleRef.current = undefined;
			}
		});

		return preventMultipleRef.current;
	};
}
