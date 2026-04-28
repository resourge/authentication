import { createContext, useContext } from 'react';

import { NoContextError } from '../errors/NoContextError';
import { type BasePermissionType } from '../types/BasePermissionType';
import { IS_DEV } from '../utils/constants';

export type PermissionsContextType<P extends BasePermissionType> = P;
 
export const PermissionsContext = createContext<PermissionsContextType<any>>(null!);

/**
 * Hook to access PermissionsContext context
 */
export const usePermissionsContext = <P extends BasePermissionType>(): PermissionsContextType<P> => {
	const context = useContext(PermissionsContext);

	if ( IS_DEV && !context ) {
		throw new NoContextError(
			'usePermissionsContext',
			'PermissionsContext'
		);
	}

	return context;
};
