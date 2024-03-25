import { useRef } from 'react';

export function usePreventMultiple<T extends any[], Result>(cb: (...args: T) => Promise<Result>) {
	const preventMultipleRef = useRef<Promise<any> | undefined>(undefined);

	return (...args: T) => {
		if ( preventMultipleRef.current ) {
			return preventMultipleRef.current;
		}
		// eslint-disable-next-line n/no-callback-literal
		preventMultipleRef.current = cb(...args)
		.finally(() => {
			preventMultipleRef.current = undefined;
		});

		return preventMultipleRef.current;
	};
}
