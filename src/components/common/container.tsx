import { cn } from "@/lib/utils";
import { DetailedHTMLProps, FC, HTMLAttributes } from "react";

export interface ContainerProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Container: FC<ContainerProps> = ({ children, className, ...props }) => {
	return (
		<div {...props} className={cn(className, "mx-auto box-content max-w-3xl px-2")}>
			{children}
		</div>
	);
};

const FormContainer: FC<ContainerProps> = ({ children, className, ...props }) => {
	return (
		<div {...props} className={cn(className, "mx-auto box-content max-w-xs px-2")}>
			{children}
		</div>
	);
};

export { Container, FormContainer };
