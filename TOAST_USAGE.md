# Toast Notification System Documentation

## Overview

The InstaGrow app uses **Sonner** as its lightweight toast notification library. The system is already integrated at the app level via the providers, so you can use it anywhere in your components.

## Installation & Setup

### Dependencies
- `sonner` version `^1.6.1` (automatically added to package.json)

### Provider Integration
The `Toaster` component is already configured in `/src/components/providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			{children}
			<Toaster />
		</SessionProvider>
	);
}
```

## Basic Usage

### Importing Toast

```tsx
import { toast } from "sonner";
```

### Toast Types

#### Success Toast
```tsx
toast.success("Success!", {
	description: "Your action completed successfully",
});
```

#### Error Toast
```tsx
toast.error("Error!", {
	description: "Something went wrong",
});
```

#### Loading Toast
```tsx
toast.loading("Processing...", {
	description: "Please wait",
});
```

#### Info Toast
```tsx
toast.info("Info", {
	description: "Here's some information",
});
```

#### Warning Toast
```tsx
toast.warning("Warning", {
	description: "Be careful with this action",
});
```

#### Promise Toast
```tsx
toast.promise(
	myAsyncFunction(),
	{
		loading: "Loading...",
		success: "Success!",
		error: "Error occurred",
	}
);
```

## Real-World Example: Caption Writer

The Caption Writer component demonstrates proper implementation:

```tsx
"use client";

import { toast } from "sonner";

export default function CaptionWriterPage() {
	const copyToClipboard = async (caption: Caption) => {
		const fullCaption = `${caption.hook}\n\n${caption.body}\n\n${caption.cta}`;
		await navigator.clipboard.writeText(fullCaption);

		// Show success toast with description
		toast.success("Caption copied!", {
			description: "Your caption is ready to paste on Instagram",
		});

		setCopiedId(caption.id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	return (
		<button
			onClick={() => copyToClipboard(caption)}
			className="btn btn-outline btn-sm"
		>
			<Copy className="w-4 h-4 mr-2" />
			Copy
		</button>
	);
}
```

## Toast Customization

### Options
All toast functions accept an options object:

```tsx
toast.success("Title", {
	description: "Optional description",
	duration: 4000, // Duration in milliseconds (default: 4000)
	position: "top-right", // Position: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
	dismissible: true, // Allow user to dismiss (default: true)
	closeButton: true, // Show close button (default: false)
	unstyled: false, // Remove default styles (default: false)
});
```

## Common Patterns

### Copy-to-Clipboard Action
```tsx
const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied!", {
			description: "Text copied to clipboard",
		});
	} catch (error) {
		toast.error("Failed to copy", {
			description: "Could not copy to clipboard",
		});
	}
};
```

### Form Submission
```tsx
const handleSubmit = async (data: FormData) => {
	toast.loading("Saving...", {
		description: "Please wait",
	});

	try {
		const response = await fetch("/api/save", {
			method: "POST",
			body: JSON.stringify(data),
		});

		if (response.ok) {
			toast.success("Saved!", {
				description: "Your data has been saved",
			});
		} else {
			toast.error("Failed to save", {
				description: "Please try again",
			});
		}
	} catch (error) {
		toast.error("Error", {
			description: "An unexpected error occurred",
		});
	}
};
```

### Promise-Based Operations
```tsx
const handleAsyncOperation = () => {
	toast.promise(
		myAsyncOperation(),
		{
			loading: "Processing your request...",
			success: "Operation completed successfully!",
			error: "Failed to complete operation",
		}
	);
};
```

### Dismiss Toast Programmatically
```tsx
const toastId = toast.loading("Processing...");

// Later, dismiss the specific toast
toast.dismiss(toastId);
```

## Best Practices

1. **Be Concise**: Keep messages short and actionable
   ```tsx
   // Good
   toast.success("Caption copied!");

   // Avoid
   toast.success("Your Instagram caption has been successfully copied to your system clipboard");
   ```

2. **Use Descriptions Sparingly**: Add descriptions only for complex operations
   ```tsx
   // Good - clear what happened
   toast.success("Caption copied!", {
		description: "Your caption is ready to paste on Instagram",
	});
   ```

3. **Provide Feedback**: Always confirm user actions
   ```tsx
   // User clicks a button, always show feedback
   const handleAction = async () => {
		try {
			await performAction();
			toast.success("Action completed!");
		} catch (error) {
			toast.error("Action failed");
		}
   };
   ```

4. **Use Appropriate Types**: Choose the right toast type
   - `success`: Action completed
   - `error`: Something went wrong
   - `loading`: Processing
   - `warning`: User should be cautious
   - `info`: Informational message

5. **Position Matters**: Consider where users look
   ```tsx
   // For critical feedback
   toast.error("Error!", {
		position: "top-center",
	});

   // For confirmations (less intrusive)
   toast.success("Saved!", {
		position: "bottom-right",
	});
   ```

## Styling

Sonner uses Tailwind CSS by default and respects your theme. Customize via the `Toaster` component props in `providers.tsx`:

```tsx
<Toaster
	theme="light" // or "dark" or "system"
	position="top-right"
	richColors={true}
	expand={true}
	closeButton={true}
/>
```

## Implementation Checklist for New Components

When adding toast notifications to a new component:

- [ ] Import `{ toast } from "sonner"` at the top
- [ ] Use appropriate toast type for the action
- [ ] Include a brief title and optional description
- [ ] Handle both success and error cases
- [ ] Keep messages under 100 characters
- [ ] Test on mobile (toasts should be visible)
- [ ] Consider duration - let users read it (default 4 seconds is good)

## File Locations

- **Installation**: `/package.json` - includes `sonner` dependency
- **Provider Setup**: `/src/components/providers.tsx` - `<Toaster />` component
- **Example Usage**: `/src/app/(dashboard)/dashboard/caption-writer/page.tsx` - copy button functionality

## Troubleshooting

### Toasts not showing?
- Ensure `<Toaster />` is in `providers.tsx`
- Verify your component is wrapped by the `Providers` component
- Check browser console for errors

### Custom styling not applying?
- Sonner uses Tailwind CSS - ensure Tailwind is properly configured
- Use the `Toaster` props to customize globally

### Position issues on mobile?
- Use `position="bottom-center"` for mobile-friendly notifications
- Test on actual mobile devices or use browser dev tools
