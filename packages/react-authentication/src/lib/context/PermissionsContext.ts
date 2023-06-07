import { createContext, useContext } from 'react';

import { NoContextError } from '../errors/NoContextError';
import { type BasePermissions } from '../models/BasePermissions';

export type PermissionsContextType<P extends BasePermissions> = P

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const PermissionsContext = createContext<PermissionsContextType<any>>(null!);

/**
 * Hook to access PermissionsContext context
 */
export const usePermissionsContext = <P extends BasePermissions>(): PermissionsContextType<P> => {
	const context = useContext(PermissionsContext);

	if ( __DEV__ ) {
		if ( !context ) {
			throw new NoContextError(
				'usePermissionsContext',
				'PermissionsContext'
			)
		}
	}

	return context;
}
