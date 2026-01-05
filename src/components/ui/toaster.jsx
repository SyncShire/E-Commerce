import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import React from 'react';

export function Toaster() {
	const { toasts } = useToast();

	const getIcon = (variant) => {
		switch (variant) {
			case 'success':
				return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />;
			case 'error':
			case 'destructive':
				return <XCircle className="h-5 w-5 text-red-600 shrink-0" />;
			case 'warning':
				return <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />;
			case 'info':
				return <Info className="h-5 w-5 text-blue-600 shrink-0" />;
			default:
				return null;
		}
	};

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, variant, ...props }) => {
				return (
					<Toast key={id} variant={variant} {...props}>
						{getIcon(variant)}
						<div className="grid gap-1 flex-1">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}