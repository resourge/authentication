import { Component, type ErrorInfo, type ReactNode } from 'react';

export type ErrorBoundaryProps = {
	children?: ReactNode
	/**
	 * In case errorComponent doesn't return a Component the error will continue in the ErrorBoundary Tree
	 */
	errorComponent?: (error?: any) => React.ReactNode | undefined
	/**
	 * Method call on each error "ErrorBoundary" catch's.
	 */
	onError?: (error: any, errorInfo: ErrorInfo) => void
	/**
	 * After error will render children again
	 */
	redirectOnError?: boolean
};

type ErrorBoundaryState = {
	error?: any
	hasError?: boolean
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	static getDerivedStateFromError(error: any) {
		return {
			hasError: true,
			error 
		};
	}

	state: ErrorBoundaryState = {
		hasError: false
	};

	componentDidCatch(error: Error | any, errorInfo: ErrorInfo) {
		this.props.onError && this.props.onError(error, errorInfo);
	}

	componentDidUpdate() {
		if ( this.state.hasError && this.props.redirectOnError ) {
			this.setState({
				hasError: false 
			});
		}
	}

	render() {
		if ( this.state.hasError ) {
			const errorComponent = this.props.errorComponent?.(this.state.error);
			if ( errorComponent ) {
				return (
					<>
						{ errorComponent }
					</>
				);
			}
			throw this.state.error;
		}

		return this.props.children;
	}
}
