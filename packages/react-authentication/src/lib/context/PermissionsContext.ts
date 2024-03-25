import { createContext, useContext } from 'react';

import { NoContextError } from '../errors/NoContextError';
import { type BasePermissionType } from '../types/BasePermissionType';
import { IS_DEV } from '../utils/constants';

export type PermissionsContextType<P extends BasePermissionType> = P;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const PermissionsContext = createContext<PermissionsContextType<any>>(null!);

/**
 * Hook to access PermissionsContext context
 */
export const usePermissionsContext = <P extends BasePermissionType>(): PermissionsContextType<P> => {
	const context = useContext(PermissionsContext);

	if ( IS_DEV ) {
		if ( !context ) {
			throw new NoContextError(
				'usePermissionsContext',
				'PermissionsContext'
			);
		}
	}

	return context;
};
